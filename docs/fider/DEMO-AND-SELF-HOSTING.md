# Mage-OS feedback demo and self-hosting runbook

Prepared: 2026-09-24. The Docker deployment below is a deployment template, not an installation already performed. Choose the production host, domain, mail provider and operational owner before executing it.

## What the demo demonstrates

Use [the Fider demo](https://mega-asp.pikapod.net/) to collect product ideas, discuss them, vote on requests and show a roadmap through Planned, Started and Completed statuses. Votes express interest; maintainers still decide priorities and delivery commitments.

| Item | Recorded state on 2026-09-24 |
| --- | --- |
| Hosting | PikaPods-managed Fider container |
| Last observed application version | 0.37.0; PikaPods may update it |
| Imported requests | 54 Ideas from [Mage-OS Lab discussions](https://github.com/orgs/mage-os-lab/discussions) |
| Original demo request | LTS release; retained |
| Total posts at verification | 55 |
| Imported historical votes | 147 |
| Whole-board votes at verification | 148, including the original request's vote |
| Theme | Mage-OS logo, orange accents, system typography, warm light palette and navy dark palette |

Treat these numbers as a dated baseline, not permanent expectations. Record a new baseline before migrating an active board.

### Import behavior and limitations

- The migration copied discussion titles and bodies, with original GitHub attribution, source links, dates and historical vote counts appended to each request. Attribution is textual; it does not turn the GitHub authors into the Fider post owners.
- “Blog” became “Blog (GitHub #2)” because Fider rejected the short title.
- Discussion comments, comment reactions and attachments were not separately imported. Original links and any externally hosted images still depend on their source URLs.
- This was a one-time snapshot. There is no ongoing GitHub synchronization.
- Ten accounts named `Historical GitHub vote 01 (imported)` through `Historical GitHub vote 10 (imported)` represent historical vote slots. They are reused across requests, have no supplied email addresses, and do not represent identified people.
- A request with six historical votes received one native Fider vote from each of slots 1–6. All 147 historical votes now contribute to visible counters and Most Wanted ranking. Automatic votes from the importing account were removed before seeding.
- New Fider votes add normally. A previous GitHub voter can vote again because the original voter identities are unavailable in the export.
- Keep the historical-vote explanation visible. Do not rename the placeholders to real people or count them as community registrations. Do not delete them while their votes are needed.

See the [import manifest](migration/demo-import-manifest.json) for all 54 GitHub-to-Fider mappings and historical counts. The manifest is an audit aid, not a database backup or import executable.

### What has been verified

The saved stylesheet matches the local CSS, the logo loads, and desktop light/dark feedback pages and the dark roadmap were visually checked. A static 390px preview had no horizontal overflow. Full mobile interaction, keyboard and form testing remains a pre-launch task.

## Theme backup and recovery

| File | Purpose |
| --- | --- |
| [mage-os.css](mage-os.css) | Editable, reusable stylesheet matching the saved demo theme |
| [Dated CSS backup](backups/mage-os-2026-09-24.css) | Independent recovery copy of the deployed stylesheet |
| [Checksum](backups/mage-os-2026-09-24.sha256) | SHA-256 of that recovery copy |
| [Logo PNG](mage-os-mark.png) | Square transparent image accepted by Fider's logo uploader |
| [Logo SVG](mage-os-mark.svg) | Vector source extracted from the website's existing logo |

To restore branding after a reset:

1. Sign in as an administrator. Open **Site Settings → Advanced → Custom CSS**.
2. Save any current CSS separately. Paste the complete contents of `mage-os.css`, or the dated backup if recovering the original demo theme.
3. Save without changing **Allowed URL Schemes**.
4. Open **Site Settings → General** and upload `mage-os-mark.png` as the logo. Preserve the existing title and welcome text.
5. Reload the board. Check light/dark mode, the request detail vote control, the roadmap, search, sign-in and submission forms.

The API key used for posts and votes does not authenticate the browser-only appearance-settings routes. Use an administrator browser session for this recovery.

Verify the recovery file locally:

```bash
cd docs/fider/backups
shasum -a 256 -c mage-os-2026-09-24.sha256
```

Keep the dated copy unchanged. When intentionally changing the theme, update `mage-os.css`, add a new dated backup and checksum, and record the change in Git. These files are currently local repository files; commit and push them through the normal project review process to make the backup durable off this computer.

## Choose the hosting route

**Keep PikaPods** when managed updates and low maintenance are the priority. Use its custom-domain, database-export and backup facilities. Custom CSS and a logo work without a custom container. Application-code patches are not a reliable PikaPods customization mechanism. [PikaPods app/update policy](https://docs.pikapods.com/faq/apps)

**Run your own container** when Mage-OS needs control over image versions, deployments or a future historical-vote implementation. The following template uses one Fider board, PostgreSQL, and Caddy for HTTPS. Fider officially supports Docker with PostgreSQL and SMTP or another supported mail sender. [Fider Docker guide](https://docs.fider.io/hosting-instance/)

## Before provisioning

- Assign an administrator, backup owner and update owner. Store recovery access in the team's password manager.
- Choose a production hostname; `feedback.example.org` below is a placeholder, not an approved Mage-OS domain.
- Provision a Linux host with Docker Engine and the Compose plugin. Size it for measured usage; no load test has established a capacity requirement for this demo.
- Configure DNS and inbound TCP 80/443 for Caddy. Restrict SSH to the administration path. Keep PostgreSQL and Fider's port 3000 off the public host ports.
- Configure an authenticated mail sender, verified sending domain and its required DNS records. Test delivery to more than one mail provider; email sign-in is part of the application.
- Decide whether this is a fresh board or a migration. **For a migration, do not start Fider against the empty target database before restoring the source.**
- Store `.env`, SQL dumps, credentials and API keys outside this website repository. The locally supplied `fider-key.txt` is a credential, not a documentation asset; never stage it with these files.

## Fresh installation template

Run these instructions in a dedicated directory on the destination host, such as `/srv/fider`, with suitable deployment permissions. Keep the deployment directory restricted to its operator. Do not run these commands in the website checkout.

### 1. Resolve image versions and create secrets

For a fresh installation, resolve the official stable image once, record the application version, then pin its digest:

```bash
docker pull getfider/fider:stable
docker image inspect getfider/fider:stable --format '{{index .RepoDigests 0}}'
```

Paste the resulting `getfider/fider@sha256:...` into `FIDER_IMAGE`. For migration, obtain an image matching the source Fider release first; do not assume today's stable image matches the demo. Record tested PostgreSQL and Caddy image digests before production cutover as well.

Generate separate random values locally for the database password and JWT secret:

```bash
openssl rand -hex 32
openssl rand -hex 64
```

Put the first output in `POSTGRES_PASSWORD`, the second in `JWT_SECRET`. The hex database password is safe in the connection URL below. Use single-quoted `.env` values for mail passwords containing `$` so Compose does not interpolate them.

Create `.env` with real values:

```dotenv
FIDER_IMAGE=getfider/fider@sha256:REPLACE_WITH_TESTED_DIGEST
POSTGRES_IMAGE=postgres:18
CADDY_IMAGE=caddy:2
FIDER_DOMAIN=feedback.example.org
POSTGRES_PASSWORD=REPLACE_WITH_GENERATED_HEX_PASSWORD
JWT_SECRET=REPLACE_WITH_GENERATED_SECRET
EMAIL_NOREPLY=feedback@example.org
EMAIL_SMTP_HOST=smtp.example.org
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USERNAME=REPLACE_WITH_MAIL_USERNAME
EMAIL_SMTP_PASSWORD='REPLACE_WITH_MAIL_PASSWORD'
```

```bash
chmod 600 .env
```

The template uses PostgreSQL 18. Check the actual source database major version before a migration; do not restore a newer database into an older major. PikaPods currently lists PostgreSQL 18 for Fider, but that does not prove the version of this particular pod. [PikaPods Fider notes](https://docs.pikapods.com/apps/fider)

### 2. Create `compose.yaml`

```yaml
services:
  db:
    image: ${POSTGRES_IMAGE:?Set POSTGRES_IMAGE}
    restart: unless-stopped
    environment:
      POSTGRES_USER: fider
      POSTGRES_DB: fider
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U fider -d fider']
      interval: 10s
      timeout: 5s
      retries: 10
  app:
    image: ${FIDER_IMAGE:?Set FIDER_IMAGE}
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      BASE_URL: https://${FIDER_DOMAIN:?Set FIDER_DOMAIN}
      DATABASE_URL: postgres://fider:${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD}@db:5432/fider?sslmode=disable
      JWT_SECRET: ${JWT_SECRET:?Set JWT_SECRET}
      BLOB_STORAGE: sql
      EMAIL_NOREPLY: ${EMAIL_NOREPLY:?Set EMAIL_NOREPLY}
      EMAIL_SMTP_HOST: ${EMAIL_SMTP_HOST:?Set EMAIL_SMTP_HOST}
      EMAIL_SMTP_PORT: ${EMAIL_SMTP_PORT:-587}
      EMAIL_SMTP_USERNAME: ${EMAIL_SMTP_USERNAME:?Set EMAIL_SMTP_USERNAME}
      EMAIL_SMTP_PASSWORD: ${EMAIL_SMTP_PASSWORD:?Set EMAIL_SMTP_PASSWORD}
      EMAIL_SMTP_ENABLE_STARTTLS: 'true'
  proxy:
    image: ${CADDY_IMAGE:?Set CADDY_IMAGE}
    restart: unless-stopped
    depends_on:
      - app
    environment:
      FIDER_DOMAIN: ${FIDER_DOMAIN:?Set FIDER_DOMAIN}
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
volumes:
  postgres_data:
  caddy_data:
  caddy_config:
```

This PostgreSQL 18 volume path differs from the older `.../data` example in Fider's guide. Use the directory layout required by the selected major version. Do not change database majors by simply replacing an image tag on an existing volume. [Official PostgreSQL image documentation](https://github.com/docker-library/docs/blob/master/postgres/README.md)

`sslmode=disable` here applies only to the private Compose database connection on this host. For an externally managed database, replace the connection settings with that provider's verified TLS configuration. `BLOB_STORAGE=sql` keeps uploaded assets in SQL for this new deployment; it is not a claim about the existing pod's storage mode. [Fider storage configuration source](https://github.com/getfider/fider/blob/v0.36.0/app/pkg/env/env.go)

### 3. Create `Caddyfile`

```caddyfile
{$FIDER_DOMAIN} {
  encode zstd gzip
  reverse_proxy app:3000
}
```

Caddy manages certificates for an eligible public hostname. Confirm DNS resolves to this host and certificate validation can reach it. Preserve Caddy's data volume. [Caddy reverse-proxy guide](https://caddyserver.com/docs/quick-starts/reverse-proxy)

### 4. Validate and launch a fresh board

Replace every `REPLACE_...` value and the example domain first. Run validation without printing expanded secrets:

```bash
docker compose config --quiet
docker compose pull
docker compose up -d
docker compose ps
docker compose logs --tail=100 app proxy
```

Open the HTTPS hostname, complete the initial board setup and email verification, add a second trusted administrator, and restore the CSS/logo using the branding section above. Test email sign-in from a separate session. Confirm sign-in links use the intended HTTPS hostname.

## Move the existing PikaPods demo

Prefer a database-and-assets migration so post numbers, discussions, users, statuses, comments, placeholder accounts and vote records move together. **Do not recreate the demo from the GitHub manifest when preserving the current board.** It omits later activity and account data.

### 1. Inventory and rehearse

1. Record source Fider version, `SELECT version();` from the database, storage mode, hostname, authentication providers and mail settings. Do not copy credentials into this document.
2. Record current post count, vote totals per imported post, comment counts, statuses and placeholder account IDs. Preserve the historical import manifest independently.
3. Enable the pod's database administration feature for export. Follow PikaPods' instructions, including stopping the pod for database import/export operations and closing database access afterward. Export structure and data. [PikaPods database access](https://docs.pikapods.com/manage/database)
4. Export mounted files through SFTP and any configured object storage as applicable. Determine whether logos/uploads are SQL blobs, filesystem files or S3 objects; do not assume a SQL dump covers externally stored assets. Preserve storage settings and permissions. [PikaPods file access](https://docs.pikapods.com/manage/files)
5. Store the exports encrypted outside Git. A database backup contains user/account data, not just public requests.
6. Restore into an isolated staging destination first, with outbound email directed to a test sink. Use a matching Fider image and compatible PostgreSQL version. Keep staging out of public use.

### 2. Restore into an empty target

Create the destination deployment files first. Configure storage to match the source. Start only its database:

```bash
docker compose up -d db
docker compose exec -T db pg_isready -U fider -d fider
```

Wait for readiness. Confirm the target is empty and the dump is the intended source backup. Restore **one** format:

```bash
# Plain SQL export, with source ownership/ACL commands excluded or reviewed.
docker compose exec -T db psql -U fider -d fider -v ON_ERROR_STOP=1 --single-transaction < demo.sql
```

```bash
# A pg_dump custom-format archive, if that is the format you obtained.
docker compose exec -T db pg_restore -U fider -d fider --no-owner --no-privileges --exit-on-error --single-transaction < demo.dump
```

Do not run both commands. `pg_restore` does not read plain SQL. Export without database-creation commands, source role ownership or grants where possible; resolve such statements on a reviewed copy before using the plain-SQL command. These examples intentionally omit destructive `--clean` flags. If the target already has app tables, stop and provision a separate empty destination instead of overwriting it. [PostgreSQL restore documentation](https://www.postgresql.org/docs/current/app-pgrestore.html)

Restore filesystem/S3 assets before starting the app if the source uses them. Do not copy a running PostgreSQL data directory or attach a source major's volume to a different database major.

Set the target `BASE_URL` to its intended hostname. Keep existing OAuth settings compatible with the new callback URL if OAuth is configured. Preserve `JWT_SECRET` through a secure transfer when appropriate; deliberately replacing it can invalidate existing sign-in/session tokens, so test fresh login. Then start the app and proxy:

```bash
docker compose up -d app proxy
docker compose logs --tail=100 app
```

If the application unexpectedly displays first-time setup, stop and confirm the restored database and tenant are actually being used. Do not create a second board to mask the problem.

### 3. Validate before cutover

- Compare the destination against the **fresh source snapshot**, not only the old 55-post/148-vote baseline.
- Confirm all ten labelled historical accounts exist and the 54 imported requests retain their 147 historical votes. Real votes added since migration must remain too.
- Confirm request URLs, status, attribution and original GitHub links; spot-check comments and uploads where present.
- Test new-user email sign-in, administrator access, submission, comment, vote/unvote and status changes using clearly labelled test content. Remove only the test data you created when finished.
- Confirm Most Wanted sorting, roadmap states, logo and CSS in both themes. Test a narrow viewport, keyboard focus and form validation.
- Verify backup restoration, HTTPS renewal, application logs and external availability monitoring.

### 4. Cut over

1. Agree on a short write freeze and announce where feedback will move. Keep outbound notifications controlled during rehearsal.
2. Stop source writes, take a final database/assets export, and restore it into the prepared empty cutover destination. Do not merge two independently active boards.
3. Repeat the acceptance checks, configure the real mail sender, and direct the production hostname and site links to the new service.
4. Keep the PikaPods source stopped or access-restricted as the rollback copy until acceptance. Do not leave it accepting parallel feedback.
5. If the new host has accepted writes, preserve them before rolling back. A simple DNS reversal would lose or split those submissions.
6. After the agreed retention period, retire the old pod deliberately and retain the encrypted final export according to the project's policy.

The old `pikapod.net` hostname belongs to PikaPods; moving a custom domain does not automatically redirect that URL. Update community links and leave a migration notice when feasible.

## Backups, restores and updates

Choose a recovery point objective with the team. A daily encrypted off-host database backup is a starting policy, not a backup already configured by this work. Retain deployment configuration and image digests; store secrets in a separate secured backup. For filesystem/S3 blob storage, include those assets in a coordinated recovery plan.

Example SQL-mode backup, run from the deployment directory with a unique timestamp:

```bash
umask 077
mkdir -p backups
backup_stamp=$(date -u +%Y%m%dT%H%M%SZ)
docker compose exec -T db pg_dump -U fider -d fider --format=custom --no-owner --no-acl > "backups/fider-${backup_stamp}.dump"
test -s "backups/fider-${backup_stamp}.dump"
docker compose exec -T db pg_restore --list < "backups/fider-${backup_stamp}.dump" > /dev/null
```

Check command exit codes, encrypt the result, transfer it off-host and monitor backup failures. Listing an archive is only an integrity smoke check. Prove recoverability by restoring it into a separate database and running the app against it with email delivery suppressed. Never use the live database as a restore-test target.

Before an update:

1. Read release notes and take a verified database/assets backup.
2. Restore a production copy into staging; test the new image and any migrations.
3. Record the old and new image digests. Deploy the tested digest during an agreed window.
4. Recheck email sign-in, voting, CSS, logo, roadmap and backups.
5. If rollback is needed after schema migrations, restore the compatible database/assets backup together with the old image. Do not assume downgrading only the container is safe.

Do not run `docker compose down -v` as routine maintenance: it removes named volumes. PostgreSQL major upgrades require a separate tested database migration procedure.

## If we later replace placeholder votes

A future custom Fider build could store a per-post historical baseline and add genuine Fider votes for display and ranking. That feature has **not** been implemented. Before adopting it, export the placeholder vote records, verify each post's count against the manifest, and migrate those votes into the baseline exactly once. Keeping both the placeholder votes and a new baseline would double-count support. Preserve an audit trail and distinguish historical support from unique current users.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Sign-in email never arrives | SMTP credentials, sender-domain verification, TLS/port settings and app logs; do not erase the tenant to retry mail setup |
| CSS appears reset | Restore the local CSS through Advanced Settings; check changed Fider selectors after updates |
| Logo is missing | General Settings, image upload validation and blob-storage restoration |
| Historical counters differ | Compare placeholder votes per post with the manifest; do not blindly rerun vote creation or remove genuine votes |
| Setup page appears after restore | Wrong/empty database, wrong connection settings or failed restore |
| HTTPS fails | DNS, public ports 80/443, Caddy logs, hostname and persisted Caddy data |
| CSS/form controls fail after an update | Restore the previous CSS temporarily and test against the new release; keep status meanings and controls intact |
