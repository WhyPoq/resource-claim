import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useBoot } from "../components/Boot";
import { MAX_CLAIM_MINUTES } from "../lib/constants";
import { addRecentResource } from "../lib/recentResources";

function formatCountdown(expiresAtIso) {
	if (!expiresAtIso) return [0, 0, 0];
	const ms = new Date(expiresAtIso).getTime() - Date.now();
	const clamped = Math.max(0, ms);
	let totalSec = Math.floor(clamped / 1000);

	if (totalSec == 60 * 60) {
		totalSec -= 1;
	}

	let h = Math.floor(Math.floor(totalSec / 60) / 60);
	const m = Math.floor(totalSec / 60) % 60;
	const s = totalSec % 60;

	return [h, m, s];
}

export default function ResourcePage() {
	const { id } = useParams();
	const { session } = useBoot();

	const [resource, setResource] = useState(null);
	const [ownerName, setOwnerName] = useState("");
	const [loading, setLoading] = useState(true);
	const [err, setErr] = useState("");

	// claim controls (string so user can clear field while typing)
	const [claimMinutes, setClaimMinutes] = useState(String(MAX_CLAIM_MINUTES));
	const [message, setMessage] = useState("");
	const [busy, setBusy] = useState(false);

	// local ticking display
	const [forceTickVal, forceTick] = useState(0);

	const channelRef = useRef(null);

	const isExpired = useMemo(() => {
		if (!resource?.claim_expires_at) return false;
		return new Date(resource.claim_expires_at).getTime() <= Date.now();
	}, [resource?.claim_expires_at, forceTickVal]);

	const isClaimed = useMemo(() => {
		if (!resource) return false;
		return !!resource.claimed_by && !!resource.claim_expires_at && !isExpired;
	}, [resource, isExpired]);

	const isOwner = useMemo(() => {
		if (!resource?.claimed_by) return false;
		return resource.claimed_by === session?.user?.id && isClaimed;
	}, [resource?.claimed_by, session?.user?.id, isClaimed]);

	const countdown = useMemo(() => {
		if (!isClaimed) return [0, 0, 0];
		return formatCountdown(resource.claim_expires_at);
	}, [isClaimed, resource?.claim_expires_at, forceTickVal]);

	async function fetchResource() {
		setErr("");
		const { data, error } = await supabase.rpc("get_resource", {
			p_resource_id: id,
		});
		if (error) throw error;

		setResource(data);
		addRecentResource({ id: data.id, name: data.name });
	}

	useEffect(() => {
		let cancelled = false;

		(async () => {
			setLoading(true);
			try {
				await fetchResource();
			} catch (ex) {
				if (!cancelled) setErr(ex?.message || "Failed to load resource");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	// Subscribe to realtime changes for this resource
	useEffect(() => {
		if (channelRef.current) {
			supabase.removeChannel(channelRef.current);
			channelRef.current = null;
		}

		const ch = supabase
			.channel(`resource:${id}`)
			.on("broadcast", { event: "resource_updated" }, () => {
				fetchResource().catch(() => {});
			})
			.subscribe((status) => {
				// optional debug
				// console.log("channel status:", status);
			});

		channelRef.current = ch;

		return () => {
			if (ch) supabase.removeChannel(ch);
			channelRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	// local timer tick (for countdown display)
	useEffect(() => {
		const t = setInterval(() => forceTick((x) => x + 1), 1000);
		return () => clearInterval(t);
	}, []);

	// default claim time: max allowed
	useEffect(() => {
		setClaimMinutes(String(MAX_CLAIM_MINUTES));
	}, [id]);

	// Load owner name when claimed
	useEffect(() => {
		let cancelled = false;

		async function loadOwnerName() {
			setOwnerName("");
			if (!resource?.claimed_by || !isClaimed) return;

			const { data, error } = await supabase
				.from("profiles")
				.select("name")
				.eq("id", resource.claimed_by)
				.single();

			if (cancelled) return;

			if (error) {
				setOwnerName("Unknown");
			} else {
				setOwnerName(data?.name || "Unknown");
			}
		}

		loadOwnerName().catch(() => setOwnerName("Unknown"));

		return () => {
			cancelled = true;
		};
	}, [resource?.claimed_by, isClaimed]);

	async function onClaim() {
		setBusy(true);
		setErr("");
		try {
			const minutesNum = Number(claimMinutes);
			if (!Number.isFinite(minutesNum) || minutesNum < 1 || minutesNum > MAX_CLAIM_MINUTES) {
				throw new Error(`Duration must be between 1 and ${MAX_CLAIM_MINUTES} minutes.`);
			}

			const { data, error } = await supabase.rpc("claim_resource", {
				p_resource_id: id,
				p_minutes: minutesNum,
				p_message: message,
			});
			if (error) throw error;
			setResource(data);
			setMessage("");

			await channelRef.current?.send({
				type: "broadcast",
				event: "resource_updated",
				payload: { id },
			});
		} catch (ex) {
			setErr(ex?.message || "Failed to claim");
		} finally {
			setBusy(false);
		}
	}

	async function onRelease() {
		setBusy(true);
		setErr("");
		try {
			const { data, error } = await supabase.rpc("release_resource", {
				p_resource_id: id,
			});
			if (error) throw error;
			setResource(data);

			await channelRef.current?.send({
				type: "broadcast",
				event: "resource_updated",
				payload: { id },
			});
		} catch (ex) {
			setErr(ex?.message || "Failed to release");
		} finally {
			setBusy(false);
		}
	}

	async function onExtend() {
		setBusy(true);
		setErr("");
		try {
			const { data, error } = await supabase.rpc("extend_resource", {
				p_resource_id: id,
			});
			if (error) throw error;
			setResource(data);

			await channelRef.current?.send({
				type: "broadcast",
				event: "resource_updated",
				payload: { id },
			});
		} catch (ex) {
			setErr(ex?.message || "Failed to extend");
		} finally {
			setBusy(false);
		}
	}

	if (loading) {
		return (
			<div className="flex items-center gap-3">
				<span className="loading loading-spinner loading-lg" />
				<span className="text-base-content/70">Loading resource…</span>
			</div>
		);
	}

	if (!resource) {
		return <div className="alert alert-error">Resource not found (or you lack access).</div>;
	}

	return (
		<div className="space-y-4">
			<div className="card bg-base-100 shadow min-w-md">
				<div className="card-body">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h1 className="card-title">{resource.name}</h1>
						</div>
						<button
							className="btn btn-ghost btn-sm"
							onClick={() => navigator.clipboard.writeText(window.location.href)}
						>
							Copy link
						</button>
					</div>

					{!isClaimed ? (
						<div className="mt-4 space-y-3">
							<div className="text-center font-bold mb-10 text-2xl">
								<span>Not claimed</span>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="md:col-span-1">
									<label className="label mb-1">
										<span className="label-text">Duration (minutes)</span>
									</label>

									<input
										type="number"
										className="input input-bordered w-full"
										min={1}
										max={MAX_CLAIM_MINUTES}
										value={claimMinutes}
										onChange={(e) => {
											const v = e.target.value;
											if (v === "") return setClaimMinutes("");
											const n = Number(v);
											if (Number.isNaN(n)) setClaimMinutes("");
											setClaimMinutes(n);
										}}
									/>

									<div className="text-xs text-base-content/60 mt-1 pl-1">
										1 - {MAX_CLAIM_MINUTES} minutes
									</div>
								</div>

								<div className="md:col-span-2">
									<label className="label mb-1">
										<span className="label-text">Optional message</span>
									</label>
									<input
										className="input input-bordered w-full"
										placeholder="(optional)"
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										maxLength={200}
									/>
								</div>
							</div>

							<button
								className="btn btn-primary w-full mt-4"
								onClick={onClaim}
								disabled={busy}
							>
								{busy ? (
									<span className="loading loading-spinner" />
								) : (
									"Claim resource"
								)}
							</button>
						</div>
					) : (
						<div className="mt-4 space-y-3">
							<div className="w-full">
								<div className="flex flex-col items-center gap-6">
									<div className="text-center font-bold text-2xl">
										Claimed by: {ownerName}
									</div>
									<div className="flex items-center justify-center gap-4">
										<span className="text-lg">Time left:</span>
										<span className="countdown font-mono text-2xl">
											{countdown[0] > 0 && (
												<>
													<span
														style={
															{
																"--value": countdown[0],
																"--digits": 2,
															} /* as React.CSSProperties */
														}
													>
														{countdown[0]}
													</span>
													:
												</>
											)}
											<span
												style={
													{
														"--value": countdown[1],
														"--digits": 2,
													} /* as React.CSSProperties */
												}
											>
												{countdown[1]}
											</span>
											:
											<span
												style={
													{
														"--value": countdown[2],
														"--digits": 2,
													} /* as React.CSSProperties */
												}
											>
												{countdown[2]}
											</span>
										</span>
									</div>
								</div>
							</div>

							{resource.claim_message ? (
								<div className="chat chat-start">
									<div className="chat-bubble">{resource.claim_message}</div>
								</div>
							) : null}

							{isOwner && (
								<div className="mt-7 space-y-3 flex flex-col items-start">
									<div className="flex w-full gap-6">
										<button
											className="btn btn-primary grow basis-0"
											onClick={onExtend}
											disabled={busy}
										>
											{busy ? (
												<span className="loading loading-spinner" />
											) : (
												"Extend"
											)}
										</button>
										<button
											className="btn btn-error grow basis-0"
											onClick={onRelease}
											disabled={busy}
										>
											Stop claiming
										</button>
									</div>
								</div>
							)}
						</div>
					)}

					{err ? <div className="alert alert-error mt-7 alert-soft">{err}</div> : null}
				</div>
			</div>
		</div>
	);
}
