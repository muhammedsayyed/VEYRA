export default async function handleAuthLogout() {
  return new Response(JSON.stringify({ success: true, message: 'Logged out' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'veyra_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    },
  });
}
