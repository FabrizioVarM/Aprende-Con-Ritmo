# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Solución de Errores de Git (Autenticación)

Si al intentar hacer `git push` recibes el error `remote: No anonymous write access`, sigue estos pasos:

1. **Genera un Token (PAT):** En GitHub, ve a *Settings > Developer Settings > Personal Access Tokens (classic)*. Genera un token con el permiso `repo` activado.
2. **Configura el token en la terminal:**
   ```bash
   git remote set-url origin https://<TU_TOKEN_AQUI>@github.com/FabrizioVarM/Aprende-Con-Ritmo.git
   ```
3. **Sube tus cambios:**
   ```bash
   git push origin main
   ```

*Nota: Reemplaza `<TU_TOKEN_AQUI>` por el token real que generaste en el paso 1.*
