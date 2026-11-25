import { FormEvent, useEffect, useState } from 'react';
import { fieldClass, labelClass, primaryBtn, secondaryBtn } from '../../chrome';
import { useStore } from '../../store';
import type { CompanyInfo } from '../../types';

export function AdminEmpresa() {
  const { data, saveCompany, exportWorkspace, importWorkspace } = useStore();
  const [form, setForm] = useState<CompanyInfo>(data.company);
  const [saved, setSaved] = useState(false);
  const [importError, setImportError] = useState('');

  useEffect(() => {
    document.title = 'Empresa — gestão Absoluto';
  }, []);

  useEffect(() => {
    setForm(data.company);
  }, [data.company]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    saveCompany(form);
    setSaved(true);
  };

  const download = () => {
    const blob = new Blob([exportWorkspace()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `absoluto-comercial-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <p className="ov-kicker">Contrato</p>
      <h1 className="ov-serif mt-2 text-4xl">Empresa</h1>
      <p className="mt-3 text-[color:var(--ov-muted)]">Estes dados entram no contrato. Tudo é local neste navegador — exporte o JSON com frequência.</p>

      <form className="ov-card mt-8 max-w-xl space-y-4 p-6" onSubmit={submit}>
        <label>
          <span className={labelClass}>Razão social da construtora</span>
          <input className={fieldClass} value={form.legalName} onChange={(e) => setForm((c) => ({ ...c, legalName: e.target.value }))} />
        </label>
        <label>
          <span className={labelClass}>CNPJ</span>
          <input className={fieldClass} value={form.cnpj} onChange={(e) => setForm((c) => ({ ...c, cnpj: e.target.value }))} />
        </label>
        <label>
          <span className={labelClass}>Endereço</span>
          <input className={fieldClass} value={form.address} onChange={(e) => setForm((c) => ({ ...c, address: e.target.value }))} />
        </label>
        <label>
          <span className={labelClass}>E-mail</span>
          <input className={fieldClass} value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} />
        </label>
        <button type="submit" className={primaryBtn}>
          Salvar empresa
        </button>
        {saved ? <p className="text-sm text-[color:var(--ov-muted)]">Contratos novos usam estes dados.</p> : null}
      </form>

      <div className="ov-card mt-8 max-w-xl space-y-4 p-6">
        <h2 className="ov-serif text-2xl">Backup local</h2>
        <p className="text-sm text-[color:var(--ov-muted)]">Exporta carteira, contratos, cadastros e empresa. Sem isso, limpar o navegador apaga a operação.</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className={primaryBtn} onClick={download}>
            Baixar JSON
          </button>
          <label className={secondaryBtn}>
            Importar JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                try {
                  importWorkspace(await file.text());
                  setImportError('');
                } catch {
                  setImportError('JSON inválido.');
                }
              }}
            />
          </label>
        </div>
        {importError ? <p className="text-sm text-[color:var(--ov-danger)]">{importError}</p> : null}
      </div>
    </div>
  );
}
