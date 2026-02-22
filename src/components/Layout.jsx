import { Link, useNavigate } from "react-router-dom";
import { useBoot } from "./Boot";
import ThemeToggle from "./ThemeToggle";

export default function Layout({ children }) {
	const { profile } = useBoot();
	const nav = useNavigate();

	return (
		<div className="min-h-screen bg-base-200 flex flex-col">
			<div className="navbar bg-base-100 shadow-sm pl-10 pr-10">
				<div className="flex-1">
					<Link className="text-lg normal-case font-bold btn btn-ghost" to="/">
						Resource Claim
					</Link>
				</div>
				<div className="flex gap-6 items-center">
					<ThemeToggle />

					<Link className="link link-hover text-lg" to="/info">
						Info
					</Link>
					{profile?.name && (
						<button
							className="btn btn-ghost btn-sm text-lg"
							onClick={() => nav("/profile")}
							title="Edit profile"
						>
							{profile.name}
						</button>
					)}
				</div>
			</div>

			<div className="max-w-3xl mx-auto p-4 flex-1 flex items-center">{children}</div>
		</div>
	);
}
