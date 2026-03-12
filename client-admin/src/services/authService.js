const API_BASE = '/api/auth'

const json = async (res) => {
	const text = await res.text()
	try { return JSON.parse(text) } catch { return {} }
}

export default {
	login: async (payload) => {
		const res = await fetch(`${API_BASE}/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})
		if (!res.ok) throw new Error((await json(res)).message || 'Login failed')
		return json(res)
	},
	
	getProfile: async () => {
		const token = localStorage.getItem('token')
		const res = await fetch(`${API_BASE}/profile`, {
			headers: { Authorization: token ? `Bearer ${token}` : '' },
		})
		if (!res.ok) throw new Error('Unauthorized')
		return json(res)
	},
	logout: async () => {
		await fetch(`${API_BASE}/logout`, { method: 'POST' })
	},
	updateProfile: async (payload) => {
		const token = localStorage.getItem('token')
		const res = await fetch(`${API_BASE}/profile`, {
			method: 'PUT',
			headers: { 
				'Content-Type': 'application/json',
				Authorization: token ? `Bearer ${token}` : '' 
			},
			body: JSON.stringify(payload),
		})
		if (!res.ok) throw new Error((await json(res)).message || 'Failed to update profile')
		return json(res)
	},
	changePassword: async (payload) => {
		const token = localStorage.getItem('token')
		const res = await fetch(`${API_BASE}/change-password`, {
			method: 'POST',
			headers: { 
				'Content-Type': 'application/json',
				Authorization: token ? `Bearer ${token}` : '' 
			},
			body: JSON.stringify(payload),
		})
		if (!res.ok) throw new Error((await json(res)).message || 'Failed to change password')
		return json(res)
	},
	updateProfilePicture: async (file) => {
		const token = localStorage.getItem('token')
		const formData = new FormData()
		formData.append('profilePicture', file)
		
		const res = await fetch(`${API_BASE}/profile-picture`, {
			method: 'POST',
			headers: { 
				Authorization: token ? `Bearer ${token}` : '' 
			},
			body: formData,
		})
		if (!res.ok) throw new Error((await json(res)).message || 'Failed to upload profile picture')
		return json(res)
	}
}
