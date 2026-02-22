import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Boot from "./components/Boot";

import NewUserPage from "./pages/NewUserPage";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";
import ResourcePage from "./pages/ResourcePage";
import InfoPage from "./pages/InfoPage";

export default function App() {
	return (
		<Boot>
			<Layout>
				<Routes>
					<Route path="/new-user" element={<NewUserPage />} />
					<Route path="/profile" element={<ProfilePage />} />
					<Route path="/" element={<HomePage />} />
					<Route path="/resources/:id" element={<ResourcePage />} />
					<Route path="/info" element={<InfoPage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Layout>
		</Boot>
	);
}
