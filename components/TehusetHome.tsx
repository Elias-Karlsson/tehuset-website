 'use client';
import { useEffect, useRef, useState } from 'react';
import type { Lang, MenuContent, Product, SiteContent } from './types';
import { LanguageToggle } from './LanguageToggle';
import { MenuPanel } from './MenuPanel';
import { MerchCheckout } from './MerchCheckout';

const restaurantShowcaseImages = [
  '/assets/photography/restaurant-3.jpeg',
  '/assets/photography/restaurant-4.jpeg',
  '/assets/photography/restaurant-5.jpeg',
  '/assets/photography/restaurant-6.jpeg',
  '/assets/photography/restaurant-7.jpeg',
  '/assets/photography/restaurant-8.jpeg',
];

const foodShowcaseImages = [
  '/assets/photography/food1.jpeg',
  '/assets/photography/food2.jpeg',
  '/assets/photography/food3.jpeg',
  '/assets/photography/food4.jpeg',
];

function ShowcaseSection({ id, images, imageSide, motionDirection, illustration, illustrationAlt, text, imageLabel, controlsLabel, previousImageLabel, nextImageLabel }: { id: string; images: string[]; imageSide: 'left' | 'right'; motionDirection: 'from-left' | 'from-right'; illustration: string; illustrationAlt: string; text: string; imageLabel: string; controlsLabel: string; previousImageLabel: string; nextImageLabel: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackOffsets, setTrackOffsets] = useState([0, 1, 2]);
  const [railShiftPx, setRailShiftPx] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const railRef = useRef<HTMLSpanElement | null>(null);
  const slideTimer = useRef<number | null>(null);
  const isSlidingRef = useRef(false);
  const slideDurationMs = 980;
  const wrapIndex = (index: number) => (index + images.length) % images.length;
  const trackImages = trackOffsets.map((offset) => images[wrapIndex(activeIndex + offset)]);
  const measureSlideDistance = () => {
    const rail = railRef.current;
    const railImages = Array.from(rail?.querySelectorAll('img') ?? []);
    if (!rail || railImages.length === 0) return 0;

    const imageRects = railImages.map((image) => image.getBoundingClientRect());
    for (let index = 0; index < imageRects.length - 1; index += 1) {
      const current = imageRects[index];
      const next = imageRects[index + 1];
      if (current.width > 20 && next.width > 20) {
        return Math.abs(next.left - current.left);
      }
    }

    const firstVisibleImage = imageRects.find((rect) => rect.width > 20);
    const gap = Number.parseFloat(window.getComputedStyle(rail).columnGap || '0');
    return firstVisibleImage ? firstVisibleImage.width + gap : 0;
  };

  useEffect(() => {
    images.forEach((src) => {
      const image = new Image();
      image.src = src;
      image.decode?.().catch(() => undefined);
    });

    return () => {
      if (slideTimer.current) window.clearTimeout(slideTimer.current);
    };
  }, [images]);

  const finishSlide = (direction: 'next' | 'previous') => {
    setActiveIndex((current) => wrapIndex(current + (direction === 'next' ? 1 : -1)));
    setIsSliding(false);
    isSlidingRef.current = false;
    setTrackOffsets([0, 1, 2]);
    setRailShiftPx(0);
    slideTimer.current = null;
  };

  const startSlide = (direction: 'next' | 'previous') => {
    if (isSlidingRef.current) return;
    isSlidingRef.current = true;
    const isNext = direction === 'next';
    setTrackOffsets(isNext ? [0, 1, 2, 3] : [-1, 0, 1, 2]);
    setIsSliding(false);
    setRailShiftPx(0);

    window.requestAnimationFrame(() => {
      const distance = measureSlideDistance();
      if (!distance) {
        finishSlide(direction);
        return;
      }

      const initialShift = isNext ? 0 : -distance;
      const targetShift = isNext ? -distance : 0;

      setRailShiftPx(initialShift);

      window.requestAnimationFrame(() => {
        setIsSliding(true);
        setRailShiftPx(targetShift);
        slideTimer.current = window.setTimeout(() => {
          finishSlide(direction);
        }, slideDurationMs);
      });
    });
  };

  const showNext = () => startSlide('next');
  const showPrevious = () => startSlide('previous');

  return (
    <section id={id} className={`showcase showcase--images-${imageSide} showcase--motion-${motionDirection}`}>
      <div className="showcase__deck" aria-label={imageLabel}>
        <div className="showcase__preload" aria-hidden="true">
          {images.map((src) => <img key={src} src={src} alt="" loading="eager" />)}
        </div>
        <button className="showcase__image-button" type="button" onClick={showNext} aria-label={nextImageLabel}>
          <span ref={railRef} className={`showcase__rail${isSliding ? ' showcase__rail--moving' : ''}`} style={{ transform: `translate3d(${railShiftPx}px, 0, 0)` }}>
            {trackImages.map((src, index) => (
              <img key={`${src}-${index}-${activeIndex}`} src={src} alt="Tehuset" loading="eager" />
            ))}
          </span>
        </button>
        <div className="showcase__controls" aria-label={controlsLabel}>
          <button type="button" onClick={showPrevious} aria-label={previousImageLabel}>←</button>
          <button type="button" onClick={showNext} aria-label={nextImageLabel}>→</button>
        </div>
      </div>
      <div className="showcase__copy">
        <img className="showcase__graphic" src={illustration} alt={illustrationAlt} loading="lazy" />
        <p>{text}</p>
      </div>
    </section>
  );
}

type WeatherKind = 'sun' | 'cloud' | 'rain' | 'snow' | 'storm' | 'fog';

function weatherKindForCode(code: number): WeatherKind {
  if ([0, 1].includes(code)) return 'sun';
  if ([2, 3].includes(code)) return 'cloud';
  if ([45, 48].includes(code)) return 'fog';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75].includes(code)) return 'snow';
  if ([95].includes(code)) return 'storm';
  return 'cloud';
}

function WeatherGraphic({ kind }: { kind: WeatherKind }) {
  return <span className={`weather-graphic weather-graphic--${kind}`} aria-hidden="true" />;
}

export function TehusetHome({ site, menuSv, menuEn, products }: { site: SiteContent; photos: { food: string[]; restaurant: string[] }; menuSv: MenuContent; menuEn: MenuContent; products: Product[] }) {
  const [lang, setLang] = useState<Lang>('sv');
  const [weather, setWeather] = useState('väder hämtas');
  const [weatherKind, setWeatherKind] = useState<WeatherKind>('cloud');
  const menu = lang === 'sv' ? menuSv : menuEn;
  const ui = {
    sv: {
      primaryNav: 'Primär navigering',
      contact: 'Kontakt',
      about: 'Om oss',
      history: 'Historia',
      heroImages: 'Tehuset-bilder',
      heroStatusPrefix: 'Öppet från 10 - sent',
      showcaseImages: 'Bildspel',
      imageControls: 'Bildkontroller',
      previousImage: 'Visa föregående bild',
      nextImage: 'Visa nästa bild',
      elmsAlt: 'Almgrafik',
      castleAlt: 'Slottsgrafik',
      historyCopy: 'Du hittar oss under almarna i Kungsträdgården, Stockholms vardagsrum. Kom för en varm smörgås, ett glas vin eller en lugn stund mitt i staden. Vi har hållit tekitteln varm ett tag.',
      foodCopy: 'Vår fisksoppa är skapad av den legendariske fiskaren Jack Anthony Smith, en pärla han tog med sig från Barbados. Inspirerad av livet vid vågorna, en rätt som har rest hit, från övatten till Stockholms almar, med många provsmakningar på vägen.',
      shopEyebrow: 'TEHUSET MERCH',
      instagramEyebrow: 'INSTAGRAM',
      openingHours: 'Öppettider',
      everyDay: 'Alla dagar',
      openingTime: '10 - sent',
      findUs: 'Hitta hit',
      mapLink: 'Jag behöver en riktig karta →',
      siteBy: 'Sida av Cadree',
      weatherFallback: 'aktuellt väder',
      weatherLoading: 'väder hämtas',
    },
    en: {
      primaryNav: 'Primary navigation',
      contact: 'Contact',
      about: 'About',
      history: 'History',
      heroImages: 'Tehuset hero images',
      heroStatusPrefix: 'Open from 10 - late',
      showcaseImages: 'Image carousel',
      imageControls: 'Image controls',
      previousImage: 'Show previous image',
      nextImage: 'Show next image',
      elmsAlt: 'Elms graphic',
      castleAlt: 'Castle graphic',
      historyCopy: 'You’ll find us tucked under the elms in Kungsträdgården, Stockholm’s living room. Come for a warm sandwich, a glass of wine, or a soothing moment in the middle of the city. We’ve been keeping the kettle warm for a while.',
      foodCopy: 'Our fish soup is crafted by legendary fisherman Jack Anthony Smith, a gem he brought from Barbados. Inspired by life by the swells, it’s the sort of dish that travels. From island waters to Stockholm elms, with plenty of tastings in between.',
      shopEyebrow: 'TEHUSET MERCH',
      instagramEyebrow: 'INSTAGRAM',
      openingHours: 'Opening Hours',
      everyDay: 'Every day',
      openingTime: '10 - late',
      findUs: 'Find Us',
      mapLink: 'I need a real map →',
      siteBy: 'Site by Cadree',
      weatherFallback: 'current weather',
      weatherLoading: 'weather loading',
    },
  }[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const weatherLabels: Record<Lang, Record<number, string>> = {
      sv: {
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
      },
      en: {
        0: 'clear',
        1: 'mostly clear',
        2: 'partly cloudy',
        3: 'overcast',
        45: 'fog',
        48: 'fog',
        51: 'drizzle',
        53: 'drizzle',
        55: 'drizzle',
        61: 'rain',
        63: 'rain',
        65: 'rain',
        71: 'snow',
        73: 'snow',
        75: 'snow',
        80: 'rain showers',
        81: 'rain showers',
        82: 'rain showers',
        95: 'thunderstorm',
      },
    };

    let cancelled = false;
    setWeather(ui.weatherLoading);

    fetch('https://api.open-meteo.com/v1/forecast?latitude=59.3293&longitude=18.0686&current=temperature_2m,weather_code&timezone=Europe%2FStockholm')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('weather unavailable')))
      .then((data) => {
        if (cancelled) return;
        const temperature = Math.round(data?.current?.temperature_2m);
        const code = Number(data?.current?.weather_code);
        const label = weatherLabels[lang][code] ?? ui.weatherFallback;
        setWeatherKind(Number.isFinite(code) ? weatherKindForCode(code) : 'cloud');
        setWeather(Number.isFinite(temperature) ? `${temperature}°C, ${label}` : label);
      })
      .catch(() => {
        if (!cancelled) {
          setWeatherKind('cloud');
          setWeather(ui.weatherFallback);
        }
      });

    return () => { cancelled = true; };
  }, [lang, ui.weatherFallback, ui.weatherLoading]);

  return (
    <main>
      <section className="hero monte-hero" id="top">
        <nav className="hero__nav" aria-label={ui.primaryNav}>
          <a href="#contact">{ui.contact}</a>
          <a href="#about">{ui.about}</a>
          <a href="#history">{ui.history}</a>
        </nav>
        <div className="hero__language">
          <LanguageToggle lang={lang} setLang={setLang} />
        </div>
        <div className="hero__logo-wrap">
          <img className="hero__logo" src="/assets/brand/tehuset-logo-red.png" alt="Tehuset" />
          <p className="hero__status">
            <span>{ui.heroStatusPrefix}</span>
            <span className="hero__status-separator" aria-hidden="true">•</span>
            <span className="hero__weather"><WeatherGraphic kind={weatherKind} /> {weather}</span>
            <span className="hero__status-separator" aria-hidden="true">•</span>
            <span>Stockholm</span>
          </p>
        </div>
        <div className="hero__image-strip" aria-label={ui.heroImages}>
          {site.hero.images.map((src, index) => <img key={src} src={src} alt="Tehuset" style={{ ['--delay' as string]: `${index * 180}ms` }} />)}
        </div>
      </section>

      <section className="intro-copy" id="about">
        <p>{site.sections.about?.body[lang] ?? site.hero.intro[lang]}</p>
      </section>

      <ShowcaseSection
        id="history"
        images={restaurantShowcaseImages}
        imageSide="right"
        motionDirection="from-left"
        illustration="/assets/illustrations/elms-graphic2.png"
        illustrationAlt={ui.elmsAlt}
        text={ui.historyCopy}
        imageLabel={`${ui.history} ${ui.showcaseImages}`}
        controlsLabel={ui.imageControls}
        previousImageLabel={ui.previousImage}
        nextImageLabel={ui.nextImage}
      />

      <ShowcaseSection
        id="food"
        images={foodShowcaseImages}
        imageSide="left"
        motionDirection="from-right"
        illustration="/assets/illustrations/castle-graphic2.png"
        illustrationAlt={ui.castleAlt}
        text={ui.foodCopy}
        imageLabel={`${site.sections.food.eyebrow?.[lang] ?? ui.showcaseImages} ${ui.showcaseImages}`}
        controlsLabel={ui.imageControls}
        previousImageLabel={ui.previousImage}
        nextImageLabel={ui.nextImage}
      />

      <MenuPanel menu={menu} />

      <section id="merch" className="section-block section-block--pink">
        <div className="section-block__copy">
          <h2>{site.sections.merch.title![lang]}</h2>
          <p>{site.sections.merch.body[lang]}</p>
        </div>
        <MerchCheckout lang={lang} products={products} />
      </section>

      <section id="instagram" className="section-block instagram-block">
        <a className="instagram-lockup" href="https://www.instagram.com/tehuset/" aria-label="Tehuset Instagram" target="_blank" rel="noreferrer">
          <span className="footer__instagram instagram-lockup__mark" aria-hidden="true" />
          <span className="instagram-lockup__text">tehuset</span>
        </a>
        <iframe title="Tehuset Instagram" src={`https://www.instagram.com/${site.instagramHandle}/embed`} loading="lazy" />
      </section>

      <footer id="contact" className="footer">
        <div className="footer__columns">
          <section className="footer__column" aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title">{ui.contact}</h2>
            <div className="footer__contact">
              <a href={`mailto:${site.contact.email}`}>{site.contact.email.toUpperCase()}</a>
              <a className="footer__instagram" href="https://www.instagram.com/tehuset/" aria-label="Tehuset Instagram" target="_blank" rel="noreferrer" />
            </div>
          </section>

          <section className="footer__column" aria-labelledby="footer-hours-title">
            <h2 id="footer-hours-title">{ui.openingHours}</h2>
            <div className="footer__hours">
              <p>{ui.everyDay}</p>
              <p>{ui.openingTime}</p>
            </div>
          </section>

          <section className="footer__column" aria-labelledby="footer-find-title">
            <h2 id="footer-find-title">{ui.findUs}</h2>
            <address>{site.contact.address[lang]}</address>
            <a className="footer__map-link" href="https://www.google.com/maps/search/?api=1&query=Karl%20XII%3As%20torg%209%2C%20Kungstr%C3%A4dg%C3%A5rden%2C%20Stockholm" target="_blank" rel="noreferrer">
              {ui.mapLink}
            </a>
          </section>
        </div>

        <div className="footer__mark" aria-hidden="true">
          <img src="/assets/illustrations/strommen-graphic2-white.png" alt="" />
        </div>

        <div className="footer__bottom">
          <p>© 2026 Tehuset.</p>
          <p>{ui.siteBy}</p>
        </div>
      </footer>
    </main>
  );
}
