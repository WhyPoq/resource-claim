import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getRecentResources } from "../lib/recentResources";

export default function HomePage() {
	const [name, setName] = useState("");
	const [creating, setCreating] = useState(false);
	const [err, setErr] = useState("");
	const nav = useNavigate();
	const [recent, setRecent] = useState([]);

	useEffect(() => {
		setRecent(getRecentResources());
	}, []);

	async function createResource(e) {
		e.preventDefault();
		setErr("");
		const trimmed = name.trim();
		if (!trimmed) return setErr("Resource name cannot be empty.");

		setCreating(true);
		try {
			const { data, error } = await supabase.rpc("create_resource", {
				p_name: trimmed,
			});
			if (error) throw error;

			nav(`/resources/${data}`);
		} catch (ex) {
			setErr(ex?.message || "Failed to create resource");
		} finally {
			setCreating(false);
		}
	}

	return (
		<div className="flex flex-col gap-10">
			<div className="space-y-4">
				<div className="card bg-base-100 shadow min-w-md">
					<div className="card-body">
						<h1 className="card-title">Create a resource</h1>
						<p className="text-base-content/70">
							Create a new resource and share its link with others.
						</p>

						<form onSubmit={createResource} className="mt-2 space-y-3">
							<input
								className="input input-bordered w-full"
								placeholder="Resource name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								maxLength={120}
							/>

							<button className="btn btn-primary w-full" disabled={creating}>
								{creating ? <span className="loading loading-spinner" /> : "Create"}
							</button>
						</form>

						{err ? (
							<div className="alert alert-error mt-7 alert-soft">{err}</div>
						) : null}
					</div>
				</div>
			</div>
			{recent.length > 0 && (
				<div className="card bg-base-100 shadow mt-6">
					<div className="card-body">
						<h2 className="card-title">Recently visited</h2>

						<div className="divide-y divide-base-200 overflow-y-scroll max-h-50">
							{recent.map((r) => (
								<div
									key={r.id}
									className="flex items-center justify-between py-3 cursor-pointer hover:bg-base-200 px-2 rounded transition"
									onClick={() => nav(`/resources/${r.id}`)}
								>
									<div className="font-medium">{r.name}</div>
									<div className="text-xs text-base-content/50">
										{new Date(r.visitedAt).toLocaleDateString()}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
