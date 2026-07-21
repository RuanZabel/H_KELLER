import { Download, QrCode, WalletCards } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import { useDogs } from '../context/DogContext.jsx';

export default function DigitalWalletsPage() {
  const { dogs } = useDogs();

  return (
    <section className="screen animate-in">
      <PageHeader eyebrow="Uso interno" title="Carteiras digitais">
        <button className="primary-action"><Download size={18} /> Exportar</button>
      </PageHeader>
      <div className="wallet-grid">
        {dogs.slice(0, 4).map((dog) => (
          <article className="wallet-card" key={dog.rga}>
            <div className="avatar large">🐾</div>
            <div>
              <p className="eyebrow">{dog.rga}</p>
              <h3>{dog.name}</h3>
              <p>{dog.breed} · {dog.sex}</p>
              <p>Microchip: {dog.chip || 'Pendente'}</p>
            </div>
            <div className="qr-box"><QrCode size={58} /><span>Restrito</span></div>
          </article>
        ))}
      </div>
    </section>
  );
}
