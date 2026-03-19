# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Solución de Errores de Git (Autenticación)

Si al intentar hacer `git push` recibes el error `remote: No anonymous write access` o fallos con `askpass.sh`, sigue estos pasos para autenticarte correctamente:

1. **Genera un Token (PAT):** En tu cuenta de GitHub, ve a *Settings > Developer Settings > Personal Access Tokens (classic)*. Genera un nuevo token con el permiso `repo` activado y kópialo.
2. **Configura el token en tu terminal:** Ejecuta el siguiente comando reemplazando `<TU_TOKEN_AQUI>` por el código que copiaste:
   ```bash
   git remote set-url origin https://<TU_TOKEN_AQUI>@github.com/FabrizioVarM/Aprende-Con-Ritmo.git
   ```
3. **Sube tus cambios:** Ahora ya puedes hacer push normalmente:
   ```bash
   git push origin main
   ```

*Nota: El token actúa como tu contraseña para la terminal en este entorno seguro.*
