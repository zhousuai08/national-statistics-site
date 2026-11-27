# World in Numbers — National Statistics for 24 Countries

[![best-national-statistics-site-20261126-0539](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/zhousuai08/national-statistics-site/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/zhousuai08/national-statistics-site/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)

A national statistics site that runs offline in a web browser, on a desktop and on
a phone, from its own static files. It covers **24 countries** — home to about
5.9 billion people — across **12 indicators**: population, GDP, GDP per capita,
GDP growth, life expectancy, fertility, urban share, population 65+, unemployment,
internet users, under-5 mortality and renewable energy share.

## What it does

- **Dashboard** — world totals for the 24, largest populations, richest per person,
  longest lives, and a card for every country.
- **Rankings** — all 24 countries in one sortable table; pick any indicator to rank
  by, click any column to sort.
- **Compare** — tick two to four countries and see all twelve indicators side by
  side, with the best and worst of the picked set marked, plus a GDP-per-capita chart.
- **Country pages** — all twelve indicators for one country, each with its rank
  among the 24, its year, and a bar against the highest in the set.
- **Sources & method** — where every figure came from, the year of each indicator,
  and what to watch out for.

## Where the numbers come from

Every figure is from the **World Bank, World Development Indicators**, fetched
27 November 2026 from the public API (`api.worldbank.org/v2`). All indicators are
**2024** except renewable energy share (**2021**, the latest year published).
The numbers in the site were checked cell by cell against the API dump
(288 cells, no mismatches). The full source log is kept outside this repository.

## The site

- Static files under `app/`, no build step, no network requests, no tracking.
- Charts are hand-drawn SVG bars — no library, so the first load stays small.
- 4 screenshots: dashboard, rankings, a country page, and the dashboard on a phone.
