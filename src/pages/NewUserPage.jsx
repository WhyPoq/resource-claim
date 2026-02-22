import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useBoot } from "../components/Boot";

export default function NewUserPage() {
	const { session, setProfile } = useBoot();
	const [name, setName] = useState("");
	const [saving, setSaving] = useState(false);
	const [err, setErr] = useState("");
	const nav = useNavigate();
	const location = useLocation();
	const from = location.state?.from || "/";

	async function onSubmit(e) {
		e.preventDefault();
		setErr("");
		const trimmed = name.trim();
		if (!trimmed) return setErr("Please enter your name.");

		setSaving(true);
		try {
			const userId = session.user.id;
			const { data, error } = await supabase
				.from("profiles")
				.insert({ id: userId, name: trimmed })
				.select("id,name")
				.single();

			if (error) throw error;
			setProfile(data);
			nav(from, { replace: true });
		} catch (ex) {
			setErr(ex?.message || "Failed to save profile");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="card bg-base-100 shadow min-w-md">
			<div className="card-body">
				<h1 className="card-title">Welcome</h1>

				<form onSubmit={onSubmit} className="mt-1 space-y-3">
					<fieldset class="fieldset mb-3">
						<legend class="fieldset-legend">Enter your name</legend>
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
						{saving ? <span className="loading loading-spinner" /> : "Continue"}
					</button>
				</form>

				{err ? <div className="alert alert-error mt-7 alert-soft">{err}</div> : null}
			</div>
		</div>
	);
}
