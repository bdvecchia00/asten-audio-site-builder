interface Env {
  ASSETS: Fetcher;
  OPENAI_API_KEY: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") return json({ ok: true });
    if (url.pathname !== "/api/transcribe") return env.ASSETS.fetch(request);
    if (request.method !== "POST") return json({ error: "Método não permitido." }, 405);
    if (!env.OPENAI_API_KEY) return json({ error: "Serviço de transcrição ainda não configurado." }, 503);

    try {
      const incoming = await request.formData();
      const audio = incoming.get("audio");
      if (!(audio instanceof File)) return json({ error: "Envie um arquivo de áudio." }, 400);
      if (audio.size === 0) return json({ error: "O áudio está vazio." }, 400);
      if (audio.size > 25 * 1024 * 1024) return json({ error: "O áudio deve ter no máximo 25 MB." }, 413);

      const form = new FormData();
      form.append("file", audio, audio.name || "audio.webm");
      form.append("model", "gpt-4o-mini-transcribe");
      form.append("language", "pt");

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { authorization: `Bearer ${env.OPENAI_API_KEY}` },
        body: form,
      });
      const result = await response.json() as { text?: string; error?: { message?: string } };
      if (!response.ok || !result.text) {
        return json({ error: result.error?.message || "Falha na transcrição do áudio." }, response.status || 502);
      }
      return json({ text: result.text });
    } catch {
      return json({ error: "Não foi possível processar o áudio." }, 500);
    }
  },
};
