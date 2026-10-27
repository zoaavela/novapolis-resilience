# Hébergement

Mis en ligne le 21 octobre 2026. Les deux services sont gratuits.

| Partie | Hébergeur | Adresse |
|---|---|---|
| Site (React, Vite) | Cloudflare Pages | https://novapolis.pages.dev |
| API (FastAPI) | Render, offre Free | https://novapolis-resilience.onrender.com |

Chaque push sur `main` redéploie les deux automatiquement.

## Comment les deux parties se parlent

Le navigateur ne contacte jamais Render directement. Il appelle `novapolis.pages.dev/api/...`, et une petite fonction Cloudflare (`frontend/functions/api/[[chemin]].js`) transmet la requête à Render, puis renvoie la réponse.

```
navigateur  ->  novapolis.pages.dev/api/reseau  ->  (fonction Cloudflare)  ->  novapolis-resilience.onrender.com/reseau
```

Ce relais a deux avantages : les bloqueurs de pub ne bloquent plus rien (voir « Difficultés »), et le site et l'API ont la même origine, donc plus de problème de CORS.

## Configuration de Render (API)

Service de type **Web Service**, branche `main`, région Frankfurt.

| Réglage | Valeur |
|---|---|
| Build Command | `pip install .` |
| Start Command | `uvicorn api.main:app --app-dir backend --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/health` |
| Auto-Deploy | On Commit |

Variables d'environnement :

| Nom | Valeur | Rôle |
|---|---|---|
| `PYTHON_VERSION` | `3.12.7` | même version que sur nos PC |
| `FRONT_ORIGIN` | `https://novapolis.pages.dev,http://localhost:5173` | adresses autorisées à appeler l'API (CORS) |

## Configuration de Cloudflare Pages (site)

Projet **Pages** (pas Workers) relié au dépôt GitHub.

| Réglage | Valeur |
|---|---|
| Framework preset | React (Vite) |
| Root directory | `frontend` |
| Build command | `npm run build` |
| Build output directory | `dist` |

Variables d'environnement :

| Nom | Valeur | Rôle |
|---|---|---|
| `VITE_API_URL` | `/api` | le site appelle le relais, sur sa propre adresse |
| `NODE_VERSION` | `22` | version de Node pour le build |

`VITE_API_URL` est lue au moment du build. Après l'avoir changée, il faut redéployer.

Les en-têtes de sécurité du site sont dans `frontend/public/_headers` : nosniff, interdiction d'être affiché dans une iframe, HSTS et une politique de contenu (CSP) qui n'autorise que le site lui-même et Google Fonts.

## Sécurité

Aucune clé ni aucun secret : les deux variables sont des adresses publiques. Le HTTPS est forcé par les deux hébergeurs. Le CORS de l'API n'accepte que les adresses listées dans `FRONT_ORIGIN`, jamais `*`. L'API envoie elle-même ses en-têtes de sécurité (voir `backend/api/main.py`).

## Difficultés rencontrées

**Cloudflare propose Workers par défaut.** Le bouton « Create application » ouvre un formulaire Workers, avec une commande `npx wrangler deploy`. Ce formulaire attend un fichier de configuration `wrangler` que le projet n'a pas. La solution : revenir en arrière et choisir l'onglet **Pages**, puis « Import an existing Git repository ». Le bon formulaire se reconnaît à ses champs « Build output directory » et « Root directory ».

**L'adresse `.pages.dev` ne se renomme pas.** Le premier projet s'appelait `novapolis-resilience`. Pour obtenir `novapolis.pages.dev`, il a fallu créer un second projet avec le bon nom, supprimer l'ancien, puis mettre à jour `FRONT_ORIGIN` sur Render.

**Le bloqueur de pub cassait le site.** Dans Firefox, la console affichait « CORS request did not succeed », avec un statut `(null)`. Ce message ne venait pas d'un mauvais réglage de CORS : la requête n'avait reçu aucune réponse. En cause, uBlock, qui bloque les adresses en `onrender.com` parce que des sites d'arnaque y sont souvent hébergés. Un visiteur avec un bloqueur (le correcteur, par exemple) n'aurait rien vu. Le relais Cloudflare règle le problème pour tout le monde.

**Cloudflare a perdu l'accès au dépôt.** Après la suppression de l'ancien projet, un bandeau indiquait « This project is disconnected from your Git account ». Les push arrivaient bien sur GitHub, mais Cloudflare ne les voyait plus. La solution : sur https://github.com/settings/installations, ouvrir **Cloudflare Workers and Pages**, cliquer sur Configure et donner accès au dépôt. Il vaut mieux cocher seulement `novapolis-resilience` que tous les dépôts.

**« Retry deployment » relance l'ancien commit.** Le bouton reconstruit le même commit, pas le dernier. Comme le dernier commit avait été poussé pendant la déconnexion, Cloudflare ne l'avait jamais vu. La solution : pousser un commit vide (`git commit --allow-empty -m "Relance du déploiement"`). Sur Render, le menu **Manual Deploy**, puis **Deploy latest commit**, fait la même chose.

**L'API s'endort.** En offre gratuite, Render met l'API en veille après 15 minutes sans visite, et le réveil prend jusqu'à une minute. Le site appelle `/health` au démarrage et affiche « Réveil du serveur » en attendant. Avant une démonstration, ouvrir le site une minute à l'avance.

**Le fichier `_headers` à créer.** Le fichier `_headers` n'existait pas encore. Sous Windows, il faut le créer sans extension (pas `_headers.txt`), par exemple depuis VS Code.

## Vérifier que tout marche

1. https://novapolis-resilience.onrender.com/health renvoie `{"status":"ok"}`.
2. https://novapolis.pages.dev/api/health renvoie la même chose, cette fois via le relais.
3. Sur le site, le bandeau « Mode démonstration » n'apparaît pas, et la ville de 100 sites se charge dans l'onglet Données.
4. Le test se fait avec le bloqueur de pub activé.

## Reste à faire

- Choisir des adresses plus propres (voir la carte Trello).
- Ajouter une limite de requêtes par minute sur l'API.
