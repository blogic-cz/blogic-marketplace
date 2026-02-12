# Import dat z Petstore API

> **Verze:** 1.0
> **Datum:** 2026-01-15
> **Autor:** Ondra Popelář
> **Stav:** Draft

***

## 1. Business cíl

### 1.1 Účel procesu

* Zajistit pravidelnou synchronizaci dat o mazlíčcích z centrálního systému Petstore do lokální databáze
* Umožnit aktualizaci skladových zásob a dostupnosti zvířat v reálném čase
* Importovat objednávky a uživatelská data pro reporting a analýzu

### 1.2 Business kontext

Organizace provozuje síť chovatelských stanic a pet shopů. Centrální systém Petstore slouží jako master databáze všech zvířat dostupných k prodeji. Lokální systém potřebuje aktuální data pro:

* Zobrazení nabídky zákazníkům na webu
* Správu rezervací a objednávek
* Sledování stavu zvířat (dostupný / rezervovaný / prodaný)

### 1.3 Klíčoví stakeholdeři

| Role              | Odpovědnost                         |
| ----------------- | ----------------------------------- |
| Správce dat       | Ruční spuštění importu, řešení chyb |
| Vedoucí prodejny  | Kontrola importovaných dat          |
| IT administrátor  | Konfigurace API, monitoring         |
| Business analytik | Reporting nad importovanými daty    |

***

## 2. Vstupní a výstupní data

### 2.1 Vstupní data

**Zdroj: Petstore REST API** (`https://petstore.swagger.io/v2`)

| Název           | Zdroj                      | Popis                                              |
| --------------- | -------------------------- | -------------------------------------------------- |
| Mazlíčci        | GET /pet/findByStatus      | Seznam zvířat dle stavu (available, pending, sold) |
| Detail mazlíčka | GET /pet/{petId}           | Detailní informace o konkrétním zvířeti            |
| Kategorie       | součást Pet objektu        | Taxonomie zvířat (psi, kočky, ptáci...)            |
| Objednávky      | GET /store/order/{orderId} | Objednávky z centrálního systému                   |
| Skladové zásoby | GET /store/inventory       | Agregované počty dle stavu                         |
| Uživatelé       | GET /user/{username}       | Data obchodních partnerů                           |

### 2.2 Výstupní data

| Název          | Typ        | Cíl        | Popis                               |
| -------------- | ---------- | ---------- | ----------------------------------- |
| pet_inventory | DB tabulka | PostgreSQL | Synchronizovaný seznam mazlíčků     |
| pet_category  | DB tabulka | PostgreSQL | Číselník kategorií                  |
| pet_order     | DB tabulka | PostgreSQL | Importované objednávky              |
| import_log    | DB tabulka | PostgreSQL | Log průběhu importu                 |
| import_error  | DB tabulka | PostgreSQL | Chybové záznamy k manuálnímu řešení |

### 2.3 Datové závislosti

```
┌─────────────────────┐
│   Petstore API      │
│  (externí systém)   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐         ┌─────────────────────┐
│   Import Service    │────────►│    import_log       │
│                     │         │    import_error     │
└─────────┬───────────┘         └─────────────────────┘
          │
          ▼
┌─────────────────────┐         ┌─────────────────────┐
│   pet_inventory     │◄───────►│   pet_category      │
│   (master data)     │         │   (číselník)        │
└─────────┬───────────┘         └─────────────────────┘
          │
          ▼
┌─────────────────────┐
│   pet_order         │
│   (objednávky)      │
└─────────────────────┘
```

***

## 3. Validace dat

### 3.1 Vstupní validace

| Pole           | Pravidlo                       | Chybová hláška                                      |
| -------------- | ------------------------------ | --------------------------------------------------- |
| pet.id         | Povinné, integer > 0           | INVALID_PET_ID: ID mazlíčka musí být kladné číslo |
| pet.name       | Povinné, max 255 znaků         | INVALID_PET_NAME: Název mazlíčka je povinný       |
| pet.status     | Enum: available, pending, sold | INVALID_STATUS: Neplatný stav mazlíčka             |
| pet.photoUrls  | Pole URL adres                 | INVALID_PHOTO_URL: Neplatná URL fotografie        |
| order.petId    | Reference na existujícího pet  | UNKNOWN_PET: Mazlíček v objednávce neexistuje      |
| order.quantity | Integer >\= 1                  | INVALID_QUANTITY: Množství musí být alespoň 1      |

### 3.2 Business validace

| Validace            | Podmínka                                    | Akce při nesplnění               |
| ------------------- | ------------------------------------------- | -------------------------------- |
| Duplicita mazlíčka  | pet.id již existuje v DB                    | Aktualizace existujícího záznamu |
| Neznámá kategorie   | category.id není v číselníku                | Vytvoření nové kategorie         |
| Prodaný mazlíček    | status \= sold a existuje aktivní rezervace | Zrušení rezervace, notifikace    |
| Neplatná objednávka | order.status \= cancelled                   | Přeskočit import, log warning    |

### 3.3 Kontrola práv

| Operace          | Požadované právo          | Poznámka                     |
| ---------------- | ------------------------- | ---------------------------- |
| Spuštění importu | petstore.import.execute   | Ruční i automatické spuštění |
| Zobrazení logu   | petstore.import.viewlog   | Read-only přístup            |
| Řešení chyb      | petstore.import.resolve   | Úprava chybových záznamů     |
| Konfigurace API  | petstore.import.configure | Změna API credentials        |

***

## 4. Popis operací

### 4.1 Automatické operace

| # | Operace              | Trigger              | Popis                                  | Výstup                     |
| - | -------------------- | -------------------- | -------------------------------------- | -------------------------- |
| 1 | Import mazlíčků      | CRON 0 \*/4 \* \* \* | Import všech mazlíčků každé 4 hodiny   | pet_inventory aktualizace |
| 2 | Import objednávek    | CRON 0 \* \* \* \*   | Import nových objednávek každou hodinu | pet_order záznamy         |
| 3 | Sync inventory       | CRON 0 6 \* \* \*    | Denní synchronizace počtů              | Statistiky v logu          |
| 4 | Cleanup starých logů | CRON 0 3 \* \* 0     | Týdenní mazání logů starších 30 dní    | Uvolnění místa             |

### 4.2 Ruční operace

| # | Operace          | Vykonavatel       | Popis                             | Očekávaný výstup     |
| - | ---------------- | ----------------- | --------------------------------- | -------------------- |
| 1 | Force import     | Správce dat       | Okamžitý import mimo plán         | Aktualizovaná data   |
| 2 | Řešení chyby     | Správce dat       | Manuální oprava chybného záznamu  | Záznam v import_log |
| 3 | Reprocess failed | Správce dat       | Znovu zpracování chybných záznamů | Snížení počtu chyb   |
| 4 | Export reportu   | Business analytik | Export importovaných dat          | CSV/Excel soubor     |

### 4.3 Detail operace: Import mazlíčků

**Účel:** Synchronizace kompletního seznamu mazlíčků z Petstore API do lokální databáze

**Trigger:** CRON schedule (každé 4 hodiny) nebo ruční spuštění

**Executor:** Systém (automaticky) / Správce dat (manuálně)

**Požadované právo:** petstore.import.execute

**Vstupní data:**

| Zdroj                                   | Data   | Popis                |
| --------------------------------------- | ------ | -------------------- |
| GET /pet/findByStatus?status\=available | Pet[] | Dostupní mazlíčci    |
| GET /pet/findByStatus?status\=pending   | Pet[] | Rezervovaní mazlíčci |
| GET /pet/findByStatus?status\=sold      | Pet[] | Prodaní mazlíčci     |

**Výstupní data:**

| Cíl            | Data          | Popis                             |
| -------------- | ------------- | --------------------------------- |
| pet_inventory | INSERT/UPDATE | Upsert záznamů mazlíčků           |
| pet_category  | INSERT        | Nové kategorie (pokud neexistují) |
| import_log    | INSERT        | Záznam o průběhu importu          |
| import_error  | INSERT        | Chybné záznamy k řešení           |

**API volání:**

| Endpoint          | Metoda | Účel                                  |
| ----------------- | ------ | ------------------------------------- |
| /pet/findByStatus | GET    | Získání seznamu mazlíčků dle stavu    |
| /pet/{petId}      | GET    | Detail mazlíčka (při chybě v seznamu) |

**Validace:**

| Pravidlo                         | Akce při selhání                                |
| -------------------------------- | ----------------------------------------------- |
| Pet.id musí být unikátní         | Aktualizace existujícího záznamu                |
| Pet.name nesmí být prázdný       | Záznam do import_error s kódem MISSING_NAME   |
| Pet.status musí být validní enum | Záznam do import_error s kódem INVALID_STATUS |
| PhotoUrls musí být validní URL   | Warning v logu, import pokračuje                |

**Výjimky:**

| Výjimka                 | Automatické řešení                      | Manuální řešení                          |
| ----------------------- | --------------------------------------- | ---------------------------------------- |
| API timeout (30s)       | 3 retry pokusy s exponenciálním backoff | Notifikace správci, čekání na další CRON |
| HTTP 401 Unauthorized   | -                                       | Kontrola API credentials                 |
| HTTP 429 Rate Limit     | Čekání dle Retry-After header           | -                                        |
| HTTP 5xx Server Error   | 3 retry pokusy                          | Eskalace na IT                           |
| Nevalidní JSON response | Log error, přeskočení záznamu           | Ruční kontrola API                       |

**Retry strategie:**

* Počet pokusů: 3
* Interval: exponenciální backoff (1s, 2s, 4s)
* Timeout požadavku: 30s
* Celkový timeout operace: 15 minut

**Chybové kódy:**

| Kód               | Popis                        | Řešení                                  |
| ----------------- | ---------------------------- | --------------------------------------- |
| MISSING_NAME     | Mazlíček nemá vyplněný název | Doplnit manuálně nebo kontaktovat zdroj |
| INVALID_STATUS   | Neplatný stav mazlíčka       | Kontrola API dokumentace                |
| UNKNOWN_CATEGORY | Kategorie neexistuje         | Automaticky vytvořena nová              |
| DUPLICATE_PET    | Duplicitní ID                | Merge záznamů manuálně                  |
| API_UNAVAILABLE  | Petstore API nedostupné      | Čekání, retry                           |

### 4.4 Detail operace: Import objednávek

**Účel:** Import nových objednávek z Petstore pro evidenci prodeje

**Trigger:** CRON schedule (každou hodinu)

**Executor:** Systém

**Požadované právo:** petstore.import.execute

**Vstupní data:**

| Zdroj                      | Data                | Popis             |
| -------------------------- | ------------------- | ----------------- |
| GET /store/order/{orderId} | Order               | Detail objednávky |
| GET /store/inventory       | Map<status, count> | Stav skladu       |

**Výstupní data:**

| Cíl            | Data   | Popis                      |
| -------------- | ------ | -------------------------- |
| pet_order     | INSERT | Nové objednávky            |
| pet_inventory | UPDATE | Aktualizace stavu mazlíčka |
| import_log    | INSERT | Záznam importu             |

**API volání:**

| Endpoint               | Metoda | Účel                       |
| ---------------------- | ------ | -------------------------- |
| /store/order/{orderId} | GET    | Načtení detailu objednávky |
| /store/inventory       | GET    | Kontrolní součet           |

**Validace:**

| Pravidlo                                    | Akce při selhání                             |
| ------------------------------------------- | -------------------------------------------- |
| Order.petId musí existovat v pet_inventory | Záznam do import_error s kódem UNKNOWN_PET |
| Order.quantity >\= 1                        | Přeskočení záznamu, warning                  |
| Order.status !\= cancelled                  | Přeskočení zrušených objednávek              |

### 4.5 Stavový diagram

```
┌─────────────┐
│   PENDING   │ (nový import)
└──────┬──────┘
       │ start
       ▼
┌─────────────┐     error      ┌─────────────┐
│  RUNNING    │───────────────►│   FAILED    │
└──────┬──────┘                └──────┬──────┘
       │                              │ retry
       │ complete                     │
       ▼                              ▼
┌─────────────┐                ┌─────────────┐
│  COMPLETED  │                │  RETRYING   │
└─────────────┘                └──────┬──────┘
       ▲                              │
       │        max_retries           │
       │◄─────────────────────────────┘
       │
       │        success
       └──────────────────────────────┘
```

***

## 5. Popis UI

### 5.1 Obrazovky

| Obrazovka        | Účel                              |
| ---------------- | --------------------------------- |
| Import Dashboard | Přehled stavu importů, statistiky |
| Import Log       | Detail běhů importu               |
| Error Queue      | Fronta chyb k řešení              |
| Configuration    | Nastavení API a schedules         |

### 5.2 Detail obrazovky: Import Dashboard

**Účel:** Hlavní přehled pro správce dat - zobrazuje stav posledních importů, statistiky a rychlé akce

**Formulářová pole:** N/A (pouze zobrazení)

**Workflow:**

1. Uživatel otevře obrazovku Import Dashboard
2. Systém zobrazí přehled posledních 10 importů
3. Uživatel vidí statistiky (počet importovaných, chyb, varování)
4. Uživatel může kliknout na tlačítko "Force Import" pro okamžitý import
5. Uživatel může kliknout na řádek pro zobrazení detailu

### 5.3 Detail obrazovky: Error Queue

**Účel:** Zobrazení a řešení chybových záznamů z importu

**Formulářová pole:**

| Pole              | Typ        | Validace       |
| ----------------- | ---------- | -------------- |
| Filtr - Typ chyby | Select     | -              |
| Filtr - Datum od  | DatePicker | <\= Datum do  |
| Filtr - Datum do  | DatePicker | >\= Datum od   |
| Poznámka k řešení | Textarea   | Max 1000 znaků |

**Workflow:**

1. Uživatel otevře Error Queue
2. Systém zobrazí seznam neřešených chyb
3. Uživatel může filtrovat dle typu chyby a data
4. Uživatel klikne na chybu pro zobrazení detailu
5. Uživatel zadá poznámku k řešení
6. Uživatel klikne "Vyřešeno" nebo "Reprocess"
7. Systém aktualizuje stav záznamu

### 5.4 UI komponenty

| Komponenta          | Typ             | Viditelnost | Podmínka zobrazení              |
| ------------------- | --------------- | ----------- | ------------------------------- |
| Force Import Button | Button          | Vždy        | právo petstore.import.execute   |
| Error Count Badge   | Badge           | Podmíněně   | error_count > 0                |
| Last Import Status  | StatusIndicator | Vždy        | -                               |
| Configuration Link  | Link            | Podmíněně   | právo petstore.import.configure |

### 5.5 Uživatelské akce

| Akce            | Element             | Backend endpoint           | Poznámka            |
| --------------- | ------------------- | -------------------------- | ------------------- |
| Spustit import  | Force Import Button | POST /api/import/run       | Asynchronní operace |
| Zobrazit log    | Row click           | GET /api/import/log/{id}   | -                   |
| Vyřešit chybu   | Resolve Button      | PUT /api/import/error/{id} | Vyžaduje poznámku   |
| Reprocess chyby | Reprocess Button    | POST /api/import/reprocess | Hromadná akce       |
| Export reportu  | Export Button       | GET /api/import/export     | CSV format          |

***

## 6. Procesní výjimky

### 6.1 Očekávané výjimky

| Výjimka                   | Příčina                     | Řešení uživatelem       | Eskalace                    |
| ------------------------- | --------------------------- | ----------------------- | --------------------------- |
| Nevalidní data mazlíčka   | Chybná data v Petstore      | Oprava v Error Queue    | Kontakt na správce Petstore |
| Duplicitní kategorie      | Stejná kategorie s jiným ID | Merge kategorií         | -                           |
| Neznámý status objednávky | Nový status v Petstore API  | Úprava mapování         | IT administrátor            |
| Chybějící fotografie      | URL vrací 404               | Označit jako "bez foto" | -                           |

### 6.2 Chybové stavy

| Chyba                  | Podmínka                     | Zobrazená hláška                                                 | Doporučený postup           |
| ---------------------- | ---------------------------- | ---------------------------------------------------------------- | --------------------------- |
| API_CONNECTION_ERROR | Nelze se připojit k Petstore | "Nelze se připojit k Petstore API. Zkuste to později."           | Počkat na automatický retry |
| INVALID_CREDENTIALS   | HTTP 401                     | "Neplatné přihlašovací údaje k API."                             | Kontaktovat IT              |
| RATE_LIMIT_EXCEEDED  | HTTP 429                     | "Překročen limit požadavků. Import bude pokračovat automaticky." | Počkat                      |
| IMPORT_TIMEOUT        | Operace trvá > 15 min        | "Import vypršel. Zkuste spustit znovu."                          | Force import                |

### 6.3 Rollback / Zrušení

* **Částečný import:** Při selhání uprostřed importu zůstanou již importované záznamy. Další běh doimportuje zbývající.
* **Rollback:** Nelze provést automatický rollback. V případě potřeby je nutné obnovit DB ze zálohy.
* **Zrušení běžícího importu:** Možné přes UI (tlačítko Cancel). Již importované záznamy zůstanou.

***

## 7. Integrace na stávající systém

### 7.1 Dotčené moduly

| Modul         | Typ vazby | Popis                          |
| ------------- | --------- | ------------------------------ |
| Catalog       | Write     | Zápis importovaných mazlíčků   |
| Orders        | Write     | Zápis importovaných objednávek |
| Reporting     | Read      | Čtení dat pro reporty          |
| Notifications | Trigger   | Notifikace při chybách         |

### 7.2 Databázové tabulky

| Tabulka        | Operace (R/W/D) | Popis                   |
| -------------- | --------------- | ----------------------- |
| pet_inventory | R/W             | Hlavní tabulka mazlíčků |
| pet_category  | R/W             | Číselník kategorií      |
| pet_tag       | R/W             | Tagy mazlíčků (M:N)     |
| pet_photo     | R/W             | Fotografie mazlíčků     |
| pet_order     | R/W             | Objednávky              |
| import_log    | R/W             | Log importů             |
| import_error  | R/W/D           | Chybové záznamy         |
| import_config | R               | Konfigurace importu     |

### 7.3 API endpointy

**Externí API (Petstore):**

| Endpoint               | Metoda | Popis                     |
| ---------------------- | ------ | ------------------------- |
| /pet/findByStatus      | GET    | Seznam mazlíčků dle stavu |
| /pet/{petId}           | GET    | Detail mazlíčka           |
| /store/inventory       | GET    | Stav skladu               |
| /store/order/{orderId} | GET    | Detail objednávky         |
| /user/{username}       | GET    | Detail uživatele          |

**Interní API:**

| Endpoint               | Metoda  | Popis                 |
| ---------------------- | ------- | --------------------- |
| /api/import/run        | POST    | Spuštění importu      |
| /api/import/status     | GET     | Stav běžícího importu |
| /api/import/log        | GET     | Seznam logů           |
| /api/import/log/{id}   | GET     | Detail logu           |
| /api/import/error      | GET     | Seznam chyb           |
| /api/import/error/{id} | PUT     | Řešení chyby          |
| /api/import/reprocess  | POST    | Znovu zpracování chyb |
| /api/import/export     | GET     | Export dat            |
| /api/import/config     | GET/PUT | Konfigurace           |

### 7.4 Externí systémy

| Systém                  | Typ integrace    | Účel                    |
| ----------------------- | ---------------- | ----------------------- |
| Petstore API            | REST API (HTTPS) | Zdroj dat               |
| SMTP Server             | Email            | Notifikace při chybách  |
| Monitoring (Prometheus) | Metrics export   | Sledování stavu importu |

***

## 8. BPMN diagram

> TODO: Doplnit odkaz na BPMN diagram v Camunda Modeler nebo jiném nástroji

***

## 9. Specifika

### 9.1 Autentizace k Petstore API

Petstore API podporuje dva typy autentizace:

* **API Key:** Header `api_key` s tokenem
* **OAuth 2.0:** Scopes `read:pets`, `write:pets`

Pro import používáme API Key autentizaci. Token je uložen v konfiguraci (šifrovaně).

### 9.2 Rate Limiting

Petstore API má limit 100 požadavků za minutu. Import implementuje:

* Throttling na max 50 req/min (bezpečnostní rezerva)
* Respektování `Retry-After` headeru při HTTP 429
* Exponenciální backoff při opakovaných chybách

### 9.3 Mapování stavů

| Petstore Status | Interní Status | Poznámka           |
| --------------- | -------------- | ------------------ |
| available       | AVAILABLE      | Dostupný k prodeji |
| pending         | RESERVED       | Rezervovaný        |
| sold            | SOLD           | Prodaný            |

### 9.4 Zpracování fotografií

* PhotoUrls z Petstore jsou uloženy jako reference (URL)
* Systém nekopíruje fotografie lokálně
* Při nedostupnosti URL se zobrazí placeholder

***

## Přílohy

* [ ] BPMN soubor
* [ ] Wireframes obrazovek
* [ ] Testovací scénáře
* [x] API dokumentace: [https://petstore.swagger.io/](https://petstore.swagger.io/)

***

## Historie změn

| Verze | Datum      | Autor         | Popis změny                                     |
| ----- | ---------- | ------------- | ----------------------------------------------- |
| 1.0   | 2026-01-15 | Ondra Popelář | Prvotní verze - fake dokumentace pro demo účely |