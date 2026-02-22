import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const BootContext = createContext(null);

export function useBoot() {
	const v = useContext(BootContext);
	if (!v) throw new Error("useBoot must be used within <Boot />");
	return v;
}

async function ensureAnonSession() {
	const { data: sessionData } = await supabase.auth.getSession();

	if (sessionData?.session) return sessionData.session;

	const { data, error } = await supabase.auth.signInAnonymously();
	if (error) throw error;
	return data.session;
}

async function fetchMyProfile(userId) {
	const { data, error } = await supabase
		.from("profiles")
		.select("id,name")
		.eq("id", userId)
		.maybeSingle();

	if (error) throw error;
	return data; // null if not created yet
}

export default function Boot({ children }) {
	const [session, setSession] = useState(null);
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [bootError, setBootError] = useState("");

	const nav = useNavigate();
	const loc = useLocation();

	useEffect(() => {
		let cancelled = false;

		(async () => {
			setLoading(true);
			setBootError("");
			try {
				const s = await ensureAnonSession();

				if (cancelled) return;
				setSession(s);

				const p = await fetchMyProfile(s.user.id);
				if (cancelled) return;
				setProfile(p);

				const isNewUserRoute = loc.pathname === "/new-user";
				if (!p && !isNewUserRoute) {
					nav("/new-user", {
						replace: true,
						state: { from: loc.pathname + loc.search },
					});
				}
				if (p && isNewUserRoute) {
					nav("/", { replace: true });
				}
			} catch (e) {
				if (!cancelled) setBootError(e?.message || "Failed to start app");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
			setSession(newSession);

			if (newSession?.user?.id) {
				fetchMyProfile(newSession.user.id).then(setProfile).catch(console.error);
			} else {
				setProfile(null);
			}
		});

		return () => {
			cancelled = true;
			sub?.subscription?.unsubscribe?.();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const value = useMemo(
		() => ({
			session,
			profile,
			setProfile,
			loading,
			bootError,
			refreshProfile: async () => {
				if (!session?.user?.id) return;
				const p = await fetchMyProfile(session.user.id);
				setProfile(p);
			},
		}),
		[session, profile, loading, bootError]
	);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex items-center gap-3">
					<span className="loading loading-spinner loading-lg" />
					<span className="text-base-content/70">Loading…</span>
				</div>
			</div>
		);
	}

	if (bootError) {
		return (
			<div className="min-h-screen flex items-center justify-center p-6">
				<div className="alert alert-error max-w-xl">
					<span>{bootError}</span>
				</div>
			</div>
		);
	}

	return <BootContext.Provider value={value}>{children}</BootContext.Provider>;
}
