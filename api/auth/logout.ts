export const config = {
  runtime: 'edge',
};

export default async function handler() {
  return new Response(JSON.stringify({ success: true, message: 'Logged out' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'veyra_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    },
  });
}
