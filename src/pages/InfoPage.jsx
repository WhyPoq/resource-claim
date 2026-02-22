import { MAX_CLAIM_MINUTES } from "../lib/constants";

export default function InfoPage() {
	return (
		<div className="card bg-base-100 shadow min-w-md">
			<div className="card-body prose max-w-none">
				<h1 className="card-title">What is this?</h1>
				<p>
					This app lets a group share “resources” (rooms, devices, accounts, etc.). A
					resource can be claimed by only one person at a time.
				</p>

				<h2 className="mt-3 card-title">How it works</h2>
				<ul>
					<li>Create a resource and share its link.</li>
					<li>Claim it for a limited time (up to {MAX_CLAIM_MINUTES} minutes).</li>
					<li>While claimed, others can’t claim it.</li>
					<li>The owner can stop early or extend (within the limit).</li>
				</ul>

				<p>
					You don’t sign up with email or password. The app uses an anonymous session
					behind the scenes.
				</p>
			</div>
		</div>
	);
}
