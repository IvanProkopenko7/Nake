# Nake.games
- to projekt agregatora gier wideo stworzony w oparciu na [*IsThereAnyDeal API*](https://docs.isthereanydeal.com/). W nim będzie można znaleźć najlepsze oferty gier, najniższe ceny, promocje itd. Także porównywać ceny z różnych platform **(Steam, Epic Store, GoG Games, Ubisoft store, Gamesplanet itd.)**.

## Gdzie zobaczyć stronę?
**Za linkiem https://ivanprokopenko7.github.io/GameDeals/**

## Skąd taka nazwa?
- Nazwa pochodzi ze skrótu od nazwy handlowca z gry Beholder - [*Nathan Kehler*](https://beholder.fandom.com/wiki/Nathan_Kehler_(core)). Także to czasownik od słowa obnażyć, co odzwierciedla cel projektu - obnażyć prawdziwe ceny, które ukrywają najpopularniejsze platformy gamingowe.

## Etap postępu
- projekt jest na samym początku swojego istnienia. Aktualnie na stronie jest tylko możliwość wyszukiwania za nazwą, ale w krótkim czasie pojawią się także takie filtry jak: wyszukiwanie za oceną na Steam, za ceną najlepszej oferty, za oceną gry na Metacritic itd.(filtry podobne do tych ze strony [*isthereanydeal.com*](https://isthereanydeal.com/) . Także planuje się dodanie AI czat bota który będzie pomagał użytkownikom odnaleźć dla siebie nowe gry poprzez pisania promptów

## Firebase Auth
- Dodano prostą integrację Firebase Authentication (Email/Password) z UI: przycisk **Login**, formularz logowania/rejestracji oraz **Logout**.

Jak testować lokalnie:
1. Uruchom prosty serwer statyczny (przykładowo):
   - `npx serve` lub `python -m http.server 8080`
2. Otwórz stronę i kliknij **Login**.
3. Zarejestruj nowe konto (Create account) lub zaloguj się istniejącym e-mailem.

Uwagi:
- Aby logowanie działało konieczne jest włączenie providera **Email/Password** w panelu Firebase (console.firebase.google.com) dla projektu `nake-10402`.
- Ten projekt używa Firebase SDK z CDN (ES modules). Jeśli wolisz instalować przez npm, wykonaj `npm install firebase` i zbuduj projekt bundlerem.

