import { Link, useNavigate } from "react-router-dom";
import { useBoot } from "./Boot";

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
					<label className="swap swap-rotate btn btn-ghost btn-sm btn-circle mr-2">
						{/* this hidden checkbox controls the state */}
						<input type="checkbox" className="theme-controller" value="dracula" />

						{/* sun icon */}
						<svg
							className="swap-off h-6 w-6 fill-current"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
						>
							<path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
						</svg>

						{/* moon icon */}
						<svg
							className="swap-on h-6 w-6 fill-current"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
						>
							<path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
						</svg>
					</label>

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
