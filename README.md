# Voltaire Catalog

Mini back-office de gestion de catalogue produits (selles, étriers, accessoires de sellerie) — test technique fullstack Groupe Voltaire.

## Stack

| Couche | Technologie |
|---|---|
| Backend | FastAPI (Python) + SQLAlchemy + Pydantic |
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS v4 |
| Base de données locale | PostgreSQL 16 (Docker) |
| Base de données prod | Supabase (PostgreSQL managé) |
| Auth | JWT (python-jose + passlib/bcrypt) |
| Tests | pytest + httpx |
| Lint | ruff |
| CI/CD | GitHub Actions |
| Déploiement backend | GCP Cloud Run |
| Déploiement frontend | Vercel |

## Lancer en local

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Copier le fichier d'environnement :

```bash
cp .env.example .env
```

### Démarrage

```bash
docker compose up
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| Documentation Swagger | http://localhost:8000/docs |

### Connexion

| Champ | Valeur |
|---|---|
| Email | `admin@groupevoltaire.com` |
| Mot de passe | défini dans `.env` (`ADMIN_PASSWORD`) |

## API

| Auth | Méthode | Route | Description |
|---|---|---|---|
| Non | POST | `/auth/token` | Connexion, retourne un JWT |
| Non | GET | `/products` | Liste des produits (filtres : `category`, `in_stock`) |
| Non | GET | `/products/{id}` | Détail d'un produit |
| JWT | POST | `/products` | Créer un produit |
| JWT | PUT | `/products/{id}` | Modifier un produit |
| JWT | DELETE | `/products/{id}` | Supprimer un produit |

## Tests

```bash
cd backend
pytest tests/ -v --cov=app
```

Les tests utilisent SQLite en mémoire — aucune dépendance à PostgreSQL.

## Structure du projet

```
voltaire-catalog/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/        # products.py, auth.py
│   │   ├── models/         # SQLAlchemy ORM
│   │   ├── schemas/        # Pydantic in/out
│   │   ├── crud/           # logique DB
│   │   ├── core/           # config.py, security.py
│   │   └── db/             # session.py
│   └── tests/
├── frontend/
│   └── src/
│       ├── pages/          # LoginPage, DashboardPage, ProductFormPage, NotFoundPage
│       ├── components/     # AppLayout, StatsPanel, ConfirmModal
│       ├── services/       # api.ts
│       └── router/         # ProtectedRoute
├── .github/workflows/
│   ├── ci.yml              # lint + tests + build sur PR
│   └── cd.yml              # déploiement Cloud Run sur merge main
└── docker-compose.yml
```

## Git workflow

```
main      →  production, déclenche le CD (Cloud Run)
develop   →  intégration, déclenche le CI
feat/*    →  PR vers develop
```

## Déploiement

Le backend est déployé automatiquement sur **GCP Cloud Run** à chaque merge sur `main` via GitHub Actions.

Le frontend est déployé sur **Vercel**, connecté au repo GitHub avec la variable `VITE_API_URL` pointant vers l'URL Cloud Run.

## Choix techniques

- **FastAPI** plutôt que Django/Flask : génération automatique du Swagger, validation Pydantic native, performances ASGI.
- **PostgreSQL** : base relationnelle standard, support des ENUM pour les catégories, même moteur en local (Docker) et en prod (Supabase).
- **JWT maison** plutôt que Supabase Auth : indépendance du fournisseur, fonctionne hors ligne en local, cas d'usage simple (un seul utilisateur admin).
- **Vite + React** : build rapide, HMR instantané, TypeScript pour la sûreté du typage entre frontend et API.
- **Cloud Run** : déploiement de conteneurs sans gestion de serveurs, scale à zéro.
- **Vercel** pour le frontend : les fichiers statiques n'ont pas besoin d'un conteneur — un CDN est plus adapté et plus simple. Dans un contexte full GCP, Cloud Storage + CDN serait l'équivalent.

## Pistes d'amélioration

- **Supabase Storage** : upload d'images produit (actuellement champ URL texte)
- **Pagination** sur `GET /products`
- **Soft delete** (`is_archived`)
- **Rôles utilisateurs** (admin / readonly)
- **Frontend sur Cloud Storage + CDN** dans un contexte full GCP
