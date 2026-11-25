import { FormEvent, useEffect, useState } from 'react';
import { fieldClass, labelClass, primaryBtn } from '../../chrome';
import { BR_STATES, formatCpf, formatPhone, formatZip } from '../../format';
import { useStore } from '../../store';
import type { AccountType, PixType } from '../../types';

export function MembersAccount() {
  const { currentRep, saveAccount, exportWorkspace } = useStore();
  const rep = currentRep!;
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState(rep.fullName);
  const [commercialEmail, setCommercialEmail] = useState(rep.commercialEmail);
  const [phone, setPhone] = useState(rep.phone);
  const [creci, setCreci] = useState(rep.creci);
  const [cpf, setCpf] = useState(rep.cpf);
  const [address, setAddress] = useState(rep.address);
  const [regionCity, setRegionCity] = useState(rep.regionCity);
  const [regionState, setRegionState] = useState(rep.regionState);
  const [bio, setBio] = useState(rep.bio);
  const [bankName, setBankName] = useState(rep.bank.bankName);
  const [agency, setAgency] = useState(rep.bank.agency);
  const [account, setAccount] = useState(rep.bank.account);
  const [accountType, setAccountType] = useState<AccountType>(rep.bank.accountType);
  const [holder, setHolder] = useState(rep.bank.holder);
  const [pixType, setPixType] = useState<PixType>(rep.bank.pixType);
  const [pixKey, setPixKey] = useState(rep.bank.pixKey);

  useEffect(() => {
    document.title = 'Minha conta — Área do corretor';
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!fullName.trim()) {
      setError('Informe seu nome.');
      return;
    }
    saveAccount({
      fullName,
      commercialEmail: commercialEmail.trim().toLowerCase(),
      phone,
      creci: creci.trim(),
      cpf,
      address,
      regionCity,
      regionState,
      bio,
      bank: {
        bankName,
        agency,
        account,
        accountType,
        holder,
        pixType,
        pixKey,
      },
    });
    setSaved(true);
  };

  return (
    <div>
      <p className="ov-kicker">Conta</p>
      <h1 className="ov-serif mt-2 text-4xl">Seus dados</h1>
      <p className="mt-3 max-w-2xl text-[color:var(--ov-muted)]">Entram no contrato (cláusula de intermediação) e no pagamento da comissão.</p>

      <form className="ov-card mt-8 max-w-xl space-y-4 p-6" onSubmit={submit}>
        <label>
          <span className={labelClass}>Nome</span>
          <input className={fieldClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label>
          <span className={labelClass}>E-mail comercial</span>
          <input className={fieldClass} type="email" value={commercialEmail} onChange={(e) => setCommercialEmail(e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className={labelClass}>CRECI</span>
            <input className={fieldClass} value={creci} onChange={(e) => setCreci(e.target.value)} />
          </label>
          <label>
            <span className={labelClass}>CPF</span>
            <input className={fieldClass} value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} />
          </label>
        </div>
        <label>
          <span className={labelClass}>WhatsApp</span>
          <input className={fieldClass} value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} />
        </label>
        <div className="grid grid-cols-[1fr_90px] gap-3">
          <label>
            <span className={labelClass}>Cidade</span>
            <input className={fieldClass} value={regionCity} onChange={(e) => setRegionCity(e.target.value)} />
          </label>
          <label>
            <span className={labelClass}>UF</span>
            <select className={fieldClass} value={regionState} onChange={(e) => setRegionState(e.target.value)}>
              {BR_STATES.map((uf) => (
                <option key={uf}>{uf}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          <span className={labelClass}>CEP</span>
          <input className={fieldClass} value={address.zip} onChange={(e) => setAddress((c) => ({ ...c, zip: formatZip(e.target.value) }))} />
        </label>
        <label>
          <span className={labelClass}>Endereço</span>
          <input className={fieldClass} value={address.street} onChange={(e) => setAddress((c) => ({ ...c, street: e.target.value }))} />
        </label>
        <label>
          <span className={labelClass}>Bio</span>
          <textarea className={fieldClass} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
        <label>
          <span className={labelClass}>Banco</span>
          <input className={fieldClass} value={bankName} onChange={(e) => setBankName(e.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className={labelClass}>Agência</span>
            <input className={fieldClass} value={agency} onChange={(e) => setAgency(e.target.value)} />
          </label>
          <label>
            <span className={labelClass}>Conta</span>
            <input className={fieldClass} value={account} onChange={(e) => setAccount(e.target.value)} />
          </label>
        </div>
        <label>
          <span className={labelClass}>Tipo</span>
          <select className={fieldClass} value={accountType} onChange={(e) => setAccountType(e.target.value as AccountType)}>
            <option value="corrente">Corrente</option>
            <option value="poupanca">Poupança</option>
          </select>
        </label>
        <label>
          <span className={labelClass}>Titular</span>
          <input className={fieldClass} value={holder} onChange={(e) => setHolder(e.target.value)} />
        </label>
        <label>
          <span className={labelClass}>Pix</span>
          <select className={fieldClass} value={pixType} onChange={(e) => setPixType(e.target.value as PixType)}>
            <option value="cpf">CPF</option>
            <option value="cnpj">CNPJ</option>
            <option value="email">E-mail</option>
            <option value="telefone">Telefone</option>
            <option value="aleatoria">Aleatória</option>
          </select>
        </label>
        <label>
          <span className={labelClass}>Chave Pix</span>
          <input className={fieldClass} value={pixKey} onChange={(e) => setPixKey(e.target.value)} />
        </label>
        {error ? <p className="text-sm text-[color:var(--ov-danger)]">{error}</p> : null}
        <button type="submit" className={primaryBtn}>
          Salvar conta
        </button>
        {saved ? <p className="text-sm text-[color:var(--ov-muted)]">Salvo neste navegador.</p> : null}
      </form>

      <section className="ov-card mt-6 max-w-xl p-6">
        <h2 className="ov-serif text-2xl">Backup</h2>
        <p className="mt-2 text-sm text-[color:var(--ov-muted)]">
          Clientes e propostas ficam neste navegador. Baixe um backup para não perder nada ao trocar de aparelho.
        </p>
        <button
          type="button"
          className="ov-btn ov-btn-ghost mt-4"
          onClick={() => {
            const blob = new Blob([exportWorkspace()], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `absoluto-backup-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Baixar backup (.json)
        </button>
      </section>
    </div>
  );
}
