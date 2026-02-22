import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useBoot } from "../components/Boot";

export default function ProfilePage() {
	const { session, profile, setProfile } = useBoot();
	const [name, setName] = useState(profile?.name || "");
	const [saving, setSaving] = useState(false);
	const [msg, setMsg] = useState("");
	const [err, setErr] = useState("");

	useEffect(() => setName(profile?.name || ""), [profile?.name]);

	async function save(e) {
		e.preventDefault();
		setMsg("");
		setErr("");

		const trimmed = name.trim();
		if (!trimmed) return setErr("Name cannot be empty.");

		setSaving(true);
		try {
			const { data, error } = await supabase
				.from("profiles")
				.update({ name: trimmed })
				.eq("id", session.user.id)
				.select("id,name")
				.single();

			if (error) throw error;
			setProfile(data);
			setMsg("Saved.");
		} catch (ex) {
			setErr(ex?.message || "Failed to update profile");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="card bg-base-100 shadow min-w-md">
			<div className="card-body">
				<h1 className="card-title">Edit profile</h1>

				<form onSubmit={save} className="mt-1 space-y-3">
					<fieldset class="fieldset mb-3">
						<legend class="fieldset-legend">Edit your name</legend>
						<input
							className="input input-bordered w-full"
							placeholder="Your name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							maxLength={80}
							autoFocus
						/>
					</fieldset>

					<button className="btn btn-primary w-full" disabled={saving}>
						{saving ? <span className="loading loading-spinner" /> : "Save"}
					</button>
				</form>

				{msg ? <div className="alert alert-success mt-7 alert-soft">{msg}</div> : null}
				{err ? <div className="alert alert-error mt-7 alert-soft">{err}</div> : null}
			</div>
		</div>
	);
}
