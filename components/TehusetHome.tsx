 'use client';
import { useEffect, useState } from 'react';
import type { Lang, MenuContent, Product, SiteContent } from './types';
import { LanguageToggle } from './LanguageToggle';
import { ImageFlow } from './ImageFlow';
import { MenuPanel } from './MenuPanel';
import { MerchCheckout } from './MerchCheckout';

export function TehusetHome({ site, photos, menuSv, menuEn, products }: { site: SiteContent; photos: { food: string[]; restaurant: string[] }; menuSv: MenuContent; menuEn: MenuContent; products: Product[] }) {
  const [lang, setLang] = useState<Lang>('sv');
  const [weather, setWeather] = useState('väder hämtas');
  const menu = lang === 'sv' ? menuSv : menuEn;

  useEffect(() => {
    const weatherLabels: Record<number, string> = {
      0: 'klart',
      1: 'mestadels klart',
      2: 'halvklart',
      3: 'mulet',
      45: 'dimma',
      48: 'dimma',
      51: 'duggregn',
      53: 'duggregn',
      55: 'duggregn',
      61: 'regn',
      63: 'regn',
      65: 'regn',
      71: 'snö',
      73: 'snö',
      75: 'snö',
      80: 'regnskurar',
      81: 'regnskurar',
      82: 'regnskurar',
      95: 'åska',
    };

    let cancelled = false;

    fetch('https://api.open-meteo.com/v1/forecast?latitude=59.3293&longitude=18.0686&current=temperature_2m,weather_code&timezone=Europe%2FStockholm')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('weather unavailable')))
      .then((data) => {
        if (cancelled) return;
        const temperature = Math.round(data?.current?.temperature_2m);
        const code = Number(data?.current?.weather_code);
        const label = weatherLabels[code] ?? 'aktuellt väder';
        setWeather(Number.isFinite(temperature) ? `${temperature}°C, ${label}` : label);
      })
      .catch(() => {
        if (!cancelled) setWeather('aktuellt väder');
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <main>
      <section className="hero monte-hero" id="top">
        <nav className="hero__nav" aria-label="Primary">
          <a href="#contact">Contact</a>
          <a href="#about">About</a>
          <a href="#history">History</a>
        </nav>
        <div className="hero__language">
          <LanguageToggle lang={lang} setLang={setLang} />
        </div>
        <div className="hero__logo-wrap">
          <img className="hero__logo" src="/assets/brand/tehuset-logo-red.png" alt="Tehuset" />
          <p className="hero__status">Öppet från 10 - sent <span aria-hidden="true">•</span> {weather} <span aria-hidden="true">•</span> Stockholm</p>
        </div>
        <div className="hero__image-strip" aria-label="Tehuset hero images">
          {site.hero.images.map((src, index) => <img key={src} src={src} alt="Tehuset" style={{ ['--delay' as string]: `${index * 180}ms` }} />)}
        </div>
      </section>

      <section className="intro-copy" id="about">
        <p>{site.sections.about?.body[lang] ?? site.hero.intro[lang]}</p>
      </section>

      <ImageFlow id="food" variant="food" lang={lang} images={photos.food} eyebrow={site.sections.food.eyebrow!} title={site.sections.food.title!} body={site.sections.food.body} />
      <ImageFlow id="history" variant="restaurant" lang={lang} images={photos.restaurant} eyebrow={site.sections.restaurant.eyebrow!} title={site.sections.restaurant.title!} body={site.sections.restaurant.body} />
      {site.history ? (
        <section className="history-archive" aria-labelledby="history-archive-title">
          <div className="history-archive__copy">
            <p className="eyebrow">{site.history.eyebrow[lang]}</p>
            <h2 id="history-archive-title">{site.history.title[lang]}</h2>
            <p>{site.history.body[lang]}</p>
          </div>
          <div className="history-archive__grid">
            {site.history.images.map((image) => (
              <figure className="history-archive__card" key={image.src}>
                <img src={image.src} alt={image.caption[lang]} loading="lazy" />
                <figcaption>
                  <span>{image.caption[lang]}</span>
                  <small>{image.credit}</small>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
      <MenuPanel menu={menu} />

      <section id="merch" className="section-block section-block--pink">
        <div className="section-block__copy">
          <p className="eyebrow">TEHUSET SHOP</p>
          <h2>{site.sections.merch.title![lang]}</h2>
          <p>{site.sections.merch.body[lang]}</p>
        </div>
        <MerchCheckout lang={lang} products={products} />
      </section>

      <section id="reservations" className="section-block section-block--blue">
        <p className="eyebrow">{lang === 'sv' ? 'BOKNING' : 'BOOKING'}</p>
        <h2>{site.sections.reservations.title![lang]}</h2>
        <p>{site.sections.reservations.body[lang]}</p>
        <a className="brush-button" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
      </section>

      <section id="instagram" className="section-block instagram-block">
        <p className="eyebrow">INSTAGRAM</p>
        <h2>{site.sections.instagram.title![lang]}</h2>
        <p>{site.sections.instagram.body[lang]}</p>
        <iframe title="Tehuset Instagram" src={`https://www.instagram.com/${site.instagramHandle}/embed`} loading="lazy" />
      </section>

      <footer id="contact" className="footer">
        <div>
          <img src="/assets/brand/tehuset-logo-white.png" alt="Tehuset" />
          <p>{site.sections.footer.body[lang]}</p>
        </div>
        <address>
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          <span>{site.contact.address[lang]}</span>
          {site.contact.socials.map((social) => <a key={social.url} href={social.url}>{social.label}</a>)}
        </address>
        <LanguageToggle lang={lang} setLang={setLang} tone="light" />
      </footer>
    </main>
  );
}
