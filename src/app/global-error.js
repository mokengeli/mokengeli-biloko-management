// app/global-error.js
"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <h2>Une erreur globale est survenue!</h2>
        <button onClick={() => reset()}>Réessayer</button>
      </body>
    </html>
  );
}
