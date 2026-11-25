import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const pixel = (import.meta.env.VITE_META_PIXEL_ID as string | undefined)?.trim();
const ga = (import.meta.env.VITE_GA_ID as string | undefined)?.trim();

if (pixel && !document.getElementById('absoluto-meta-pixel')) {
  const s = document.createElement('script');
  s.id = 'absoluto-meta-pixel';
  s.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`;
  document.head.appendChild(s);
}

if (ga && !document.getElementById('absoluto-ga')) {
  const src = document.createElement('script');
  src.id = 'absoluto-ga';
  src.async = true;
  src.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`;
  document.head.appendChild(src);
  const inline = document.createElement('script');
  inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`;
  document.head.appendChild(inline);
}

createRoot(document.getElementById('root')!).render(<App />);
