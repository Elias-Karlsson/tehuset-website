 'use client';
import { useState } from 'react';
import type { Lang, MenuContent, Product, SiteContent } from './types';
import { LanguageToggle } from './LanguageToggle';
import { ImageFlow } from './ImageFlow';
import { MenuPanel } from './MenuPanel';
import { MerchCheckout } from './MerchCheckout';

export function TehusetHome({ site, photos, menuSv, menuEn, products }: { site: SiteContent; photos: { food: string[]; restaurant: string[] }; menuSv: MenuContent; menuEn: MenuContent; products: Product[] }) {
  const [lang, setLang] = useState<Lang>('sv');
  const menu = lang === 'sv' ? menuSv : menuEn;

  return (
    <main>
      <header className="site-header">
        <nav className="hero-nav" aria-label="Main navigation">
          {site.navigation.map((item) => <a key={item.key} href={item.href}>{item[lang]}</a>)}
        </nav>
        <LanguageToggle lang={lang} setLang={setLang} />
      </header>

      <section className="hero" id="top">
        <div className="hero__logo-wrap">
          <img className="hero__logo" src="/assets/brand/tehuset-logo-red.png" alt="Tehuset" />
          <p>{site.hero.intro[lang]}</p>
        </div>
        <div className="hero__images" aria-label="Tehuset hero images">
          {site.hero.images.map((src, index) => <img key={src} src={src} alt="Tehuset" style={{ ['--delay' as string]: `${index * 180}ms` }} />)}
        </div>
      </section>

      <ImageFlow id="about" variant="food" lang={lang} images={photos.food} eyebrow={site.sections.food.eyebrow!} title={site.sections.food.title!} body={site.sections.food.body} />
      <ImageFlow id="history" variant="restaurant" lang={lang} images={photos.restaurant} eyebrow={site.sections.restaurant.eyebrow!} title={site.sections.restaurant.title!} body={site.sections.restaurant.body} />
      <MenuPanel menu={menu} />

      <section id="merch" className="section-block section-block--pink">
        <div className="section-block__copy">
          <h2>{site.sections.merch.title![lang]}</h2>
          <p>{site.sections.merch.body[lang]}</p>
        </div>
        <MerchCheckout lang={lang} products={products} />
      </section>

      <section id="reservations" className="section-block section-block--blue">
        <h2>{site.sections.reservations.title![lang]}</h2>
        <p>{site.sections.reservations.body[lang]}</p>
        <a className="brush-button" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
      </section>

      <section id="instagram" className="section-block instagram-block">
        <h2>{site.sections.instagram.title![lang]}</h2>
        <p>{site.sections.instagram.body[lang]}</p>
        <iframe title="Tehuset Instagram" src={`https://www.instagram.com/${site.instagramHandle}/embed`} loading="lazy" />
      </section>

      <footer id="footer" className="footer">
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
