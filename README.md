# Asten — Site por Áudio

MVP para transformar um roteiro falado em um site editável seguindo a identidade visual Asten.

## O que já funciona

- gravação e transcrição em português pelo recurso de voz do navegador;
- entrada e revisão manual do roteiro;
- organização automática em título, abertura e três seções;
- edição do conteúdo com prévia instantânea;
- visualização desktop e celular;
- exportação do resultado como arquivo HTML independente;
- interface responsiva inspirada no PowerPoint de referência.

## Executar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Limite desta primeira versão

A transcrição ao vivo depende do `SpeechRecognition` do navegador. Quando esse recurso não está disponível, o roteiro pode ser digitado ou colado. A próxima evolução recomendada é conectar uma API de transcrição no servidor e persistir projetos.
