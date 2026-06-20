# MyHyroxProg

Générateur de programme d'entraînement Hyrox personnalisé (React + Vite).

## Mettre le site en ligne (sans rien installer)

La construction du site se fait dans le cloud — tu n'as pas besoin de Node.js sur ton ordinateur.

### 1. Créer un dépôt GitHub

1. Crée un compte gratuit sur https://github.com
2. Clique sur **New repository**, nomme-le `myhyroxprog`, laisse en **Public**, clique **Create repository**.
3. Sur la page du dépôt vide, clique **uploading an existing file**.
4. Glisse-dépose **tout le contenu de ce dossier** (les fichiers ET le dossier `src`) — mais surtout **PAS** le dossier `node_modules` s'il existe.
5. Clique **Commit changes**.

### 2. Déployer avec Vercel

1. Crée un compte gratuit sur https://vercel.com en choisissant **Continue with GitHub**.
2. Clique **Add New… → Project**, puis **Import** ton dépôt `myhyroxprog`.
3. Vercel détecte Vite automatiquement. Clique simplement **Deploy**.
4. Au bout d'une minute, tu obtiens une adresse du type `myhyroxprog.vercel.app`. C'est ton site en ligne 🎉

## Continuer à le modifier

Le site est une copie de ce code. Pour le faire évoluer :

- **Option simple :** sur GitHub, ouvre `src/App.jsx`, clique sur l'icône crayon ✏️, modifie, puis **Commit changes**. Vercel redéploie automatiquement en ~1 min.
- **Avec Claude :** demande tes modifications, remplace le contenu de `src/App.jsx` par la nouvelle version, et commit. Le site se met à jour tout seul.

Tout le code de l'application se trouve dans **`src/App.jsx`**.

## Lancer en local (optionnel, pour les curieux)

```bash
npm install
npm run dev
```
