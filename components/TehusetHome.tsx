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
        <a className="site-header__left" href="#menu">{lang === 'sv' ? 'MENY' : 'MENU'}</a>
        <a className="site-header__mark" href="#top" aria-label="Tehuset home">tehuset</a>
        <div className="site-header__right">
          <a href="#reservations">{lang === 'sv' ? 'STÖRRE GRUPP' : 'LARGE GROUP'}</a>
          <LanguageToggle lang={lang} setLang={setLang} />
        </div>
      </header>

      <section className="hero monte-hero" id="top">
        <div className="hero__side hero__side--left">{lang === 'sv' ? 'ÖPPET FÖR MAT, KAFFE & TE' : 'FOOD, COFFEE & TEA'}</div>
        <div className="hero__side hero__side--right">STOCKHOLM</div>
        <div className="hero__centerpiece">
          <img className="hero__logo" src="/assets/brand/tehuset-logo-white.png" alt="Tehuset" />
          <svg className="hero__arc" viewBox="0 0 620 170" aria-hidden="true">
            <defs>
              <path id="heroArc" d="M 82 116 C 194 32, 426 32, 538 116" />
            </defs>
            <text>
              <textPath href="#heroArc" startOffset="50%" textAnchor="middle">
                {lang === 'sv' ? 'UNDER ALMARNA I KUNGSTRÄDGÅRDEN' : 'UNDER THE ELMS IN KUNGSTRÄDGÅRDEN'}
              </textPath>
            </text>
          </svg>
          <p>{site.hero.intro[lang]}</p>
        </div>
        <div className="hero__scroll-note">{lang === 'sv' ? 'Fortsätt scrolla för det goda.' : 'Keep scrolling for the good stuff.'}</div>
        <div className="hero__image-strip" aria-label="Tehuset hero images">
          {site.hero.images.map((src, index) => <img key={src} src={src} alt="Tehuset" style={{ ['--delay' as string]: `${index * 180}ms` }} />)}
        </div>
      </section>

      <section className="intro-copy" id="about">
        <p>{site.hero.intro[lang]}</p>
      </section>

      <ImageFlow id="food" variant="food" lang={lang} images={photos.food} eyebrow={site.sections.food.eyebrow!} title={site.sections.food.title!} body={site.sections.food.body} />
      <ImageFlow id="history" variant="restaurant" lang={lang} images={photos.restaurant} eyebrow={site.sections.restaurant.eyebrow!} title={site.sections.restaurant.title!} body={site.sections.restaurant.body} />
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
