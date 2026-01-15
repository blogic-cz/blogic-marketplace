# [Název procesu]

> **Verze:** 1.0
> **Datum:** YYYY-MM-DD
> **Autor:**
> **Stav:** Draft | Review | Schváleno

***

## 1. Business cíl

### 1.1 Účel procesu

[Stručný popis, proč proces existuje a jakou business hodnotu přináší]

### 1.2 Business kontext

[Širší kontext procesu v rámci organizace, vazba na business cíle]

### 1.3 Klíčoví stakeholdeři

| Role | Odpovědnost |
| ---- | ----------- |
|      |             |

***

## 2. Vstupní a výstupní data

### 2.1 Vstupní data

* API endpoint, nebo DB struktura, ze které se získávají data

| Název  | Zdroj | Popis |
| ----- | ----- |
|       |       |

### 2.2 Výstupní data

| Název | Typ | Cíl | Popis |
| ----- | --- | --- | ----- |
|       |     |     |       |

### 2.3 Datové závislosti

[Popis závislostí na jiných datech/systémech - ASCII diagram]

***

## 3. Validace dat

### 3.1 Vstupní validace

| Pole | Pravidlo | Chybová hláška |
| ---- | -------- | -------------- |
|      |          |                |

### 3.2 Business validace

| Validace | Podmínka | Akce při nesplnění |
| -------- | -------- | ------------------ |
|          |          |                    |

### 3.3 Kontrola práv

| Operace | Požadované právo | Poznámka |
| ------- | ---------------- | -------- |
|         |                  |          |

***

## 4. Popis operací

### 4.1 Automatické operace

| # | Operace | Trigger | Popis | Výstup |
| - | ------- | ------- | ----- | ------ |
| 1 |         |         |       |        |

### 4.2 Ruční operace

| # | Operace | Vykonavatel | Popis | Očekávaný výstup |
| - | ------- | ----------- | ----- | ---------------- |
| 1 |         |             |       |                  |

### 4.3 Detail operace: [Název]

**Účel:** [Popis účelu operace]

**Trigger:** [Co spouští operaci]

**Vstupní data:**

| Zdroj | Data | Popis |
| ----- | ---- | ----- |
|       |      |       |

**Výstupní data:**

| Cíl | Data | Popis |
| --- | ---- | ----- |
|     |      |       |

**Validace:**

| Pravidlo | Akce při selhání |
| -------- | ---------------- |
|          |                  |

**Výjimky:**

| Výjimka | Automatické řešení | Manuální řešení |
| ------- | ------------------ | --------------- |
|         |                    |                 |

### 4.4 Stavový diagram

```
[Stav A] --akce--> [Stav B] --akce--> [Stav C]
```

***

## 5. Popis UI

### 5.1 Obrazovky

| Obrazovka | Účel |
| --------- | ---- |
|           |      |

**Popis obrazovky: [Název]**

### 5.2 UI komponenty

| Komponenta | Typ | Viditelnost | Podmínka zobrazení |
| ---------- | --- | ----------- | ------------------ |
|            |     |             |                    |

### 5.3 Uživatelské akce

| Akce | Element | Poznámka |
| ---- | ------- | -------- |
|      |         |          |

### 5.4 Wireframe / Mockup

[Odkaz nebo vložený obrázek]

***

## 6. Procesní výjimky

### 6.1 Očekávané výjimky

| Výjimka | Příčina | Řešení uživatelem | Eskalace |
| ------- | ------- | ----------------- | -------- |
|         |         |                   |          |

### 6.2 Chybové stavy

| Chyba | Podmínka | Zobrazená hláška | Doporučený postup |
| ----- | -------- | ---------------- | ----------------- |
|       |          |                  |                   |

### 6.3 Rollback / Zrušení

[Popis možností vrácení operace nebo zrušení procesu]

***

## 7. Integrace na stávající systém

### 7.1 Dotčené moduly

| Modul | Typ vazby | Popis |
| ----- | --------- | ----- |
|       |           |       |

### 7.2 Databázové tabulky

| Tabulka | Operace (R/W/D) | Popis |
| ------- | --------------- | ----- |
|         |                 |       |

### 7.3 API endpointy

| Endpoint | Metoda | Popis |
| -------- | ------ | ----- |
|          |        |       |

### 7.4 Externí systémy

| Systém | Typ integrace | Účel |
| ------ | ------------- | ---- |
|        |               |      |

***

## 8. BPMN diagram

[Uživatel vloží odkaz na BPMN diagram]

***

## 9. Specifika

[Sekce pro specifické aspekty procesu - např. AML zpracování, konverze měn, speciální business logika]

***

## Přílohy

* [ ] BPMN soubor
* [ ] Wireframes
* [ ] Technická specifikace
* [ ] Testovací scénáře

***

## Historie změn

| Verze | Datum | Autor | Popis změny   |
| ----- | ----- | ----- | ------------- |
| 1.0   |       |       | Prvotní verze |