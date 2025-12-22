import { useEffect, useState } from "react";
import {
  FileText,
  FlaskConical,
  TestTube,
  Plus,
  PlusCircle,
  X,
} from "lucide-react";
import Input from "./Input";
import Button from "./Button";

/* helper to concatenate classes */
function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

const tabs = [
  {
    id: "info",
    label: "Informações Principais",
    icon: <FileText className="w-5 h-5" />,
    color: "#1e88e5",
  },
  {
    id: "lab",
    label: "Laboratório",
    icon: <FlaskConical className="w-5 h-5" />,
    color: "#10b981",
  },
  {
    id: "chemicals",
    label: "Químicos",
    icon: <TestTube className="w-5 h-5" />,
    color: "#ec4899",
  },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function PastaOrganizadora({
  activeTab: controlledActive,
  onTabChange,
  children,
}) {
  const [active, setActive] = useState(controlledActive || tabs[0].id);

  // forms
  const [labForm, setLabForm] = useState({
    name: "",
    movementType: "consumo",
    qty: "1",
    movement_date: todayISO(),
    request_date: "",
    arrival_date: "",
  });
  const [chemForm, setChemForm] = useState({
    name: "",
    movementType: "consumo",
    qty: "1",
    movement_date: todayISO(),
    request_date: "",
    arrival_date: "",
  });

  const [labErrors, setLabErrors] = useState({});
  const [chemErrors, setChemErrors] = useState({});
  const [labSuccess, setLabSuccess] = useState(false);
  const [chemSuccess, setChemSuccess] = useState(false);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    unid: "",
    codRM: "",
    cost: "",
    classification: "Reagentes",
    department: "",
  });
  const [newProductErrors, setNewProductErrors] = useState({});
  const [newProductSuccess, setNewProductSuccess] = useState(false);

  useEffect(() => {
    if (controlledActive) setActive(controlledActive);
  }, [controlledActive]);

  function validateForm(form) {
    const errs = {};
    if (!form.name || !form.name.trim()) errs.name = "Nome é obrigatório";
    if (!(Number(form.qty) > 0)) errs.qty = "Quantidade deve ser maior que 0";
    if (
      form.movementType === "entrada" &&
      form.request_date &&
      form.arrival_date
    ) {
      if (new Date(form.request_date) > new Date(form.arrival_date))
        errs.dates =
          "Data de solicitação não pode ser posterior à data de chegada";
    }
    return errs;
  }

  function validateNewProduct(product) {
    const errs = {};
    if (!product.name || !product.name.trim()) errs.name = "Nome é obrigatório";
    if (!product.unid || !product.unid.trim())
      errs.unid = "Unidade é obrigatória";
    if (product.classification === "Insumo da Usina" && !product.department) {
      errs.department = "Departamento é obrigatório para Insumo da Usina";
    }
    return errs;
  }

  function isFormValid(form) {
    const errs = validateForm(form);
    return Object.keys(errs).length === 0;
  }

  async function handleLabSubmit(e) {
    e.preventDefault();
    const errs = validateForm(labForm);
    setLabErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      // Aqui você pode adicionar lógica para salvar localmente ou enviar para backend
      console.log("LAB Form submitted:", labForm);
      setLabForm({
        name: "",
        movementType: "consumo",
        qty: "1",
        movement_date: todayISO(),
        request_date: "",
        arrival_date: "",
      });
      setLabErrors({});
      setLabSuccess(true);
      setTimeout(() => setLabSuccess(false), 2000);
    } catch (err) {
      console.error("handleLabSubmit:", err);
    }
  }

  async function handleChemSubmit(e) {
    e.preventDefault();
    const errs = validateForm(chemForm);
    setChemErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      // Aqui você pode adicionar lógica para salvar localmente ou enviar para backend
      console.log("CHEM Form submitted:", chemForm);
      setChemForm({
        name: "",
        movementType: "consumo",
        qty: "1",
        movement_date: todayISO(),
        request_date: "",
        arrival_date: "",
      });
      setChemErrors({});
      setChemSuccess(true);
      setTimeout(() => setChemSuccess(false), 2000);
    } catch (err) {
      console.error("handleChemSubmit:", err);
    }
  }

  async function handleNewProductSave(e) {
    e.preventDefault();
    const errs = validateNewProduct(newProduct);
    setNewProductErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      // Aqui você pode adicionar lógica para salvar localmente ou enviar para backend
      console.log("New product saved:", newProduct);
      setNewProduct({
        name: "",
        unid: "",
        codRM: "",
        cost: "",
        classification: "Reagentes",
        department: "",
      });
      setNewProductErrors({});
      setNewProductSuccess(true);
      setTimeout(() => {
        setNewProductSuccess(false);
        setIsNewModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error("handleNewProductSave:", err);
    }
  }

  function change(id) {
    if (onTabChange) onTabChange(id);
    else setActive(id);
  }

  // get current tab color
  const currentTab = tabs.find((t) => t.id === active) || tabs[0];

  return (
    <div className="relative">
      {/* Tabs */}
      <div className="flex gap-1 mb-[-1px] relative z-10">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => change(tab.id)}
              aria-pressed={isActive}
              className={cn(
                "px-6 py-3 rounded-t-lg font-medium transition-all duration-300 flex items-center gap-2 border-t-4 border-x",
                "hover:-translate-y-1 hover:shadow-md",
                isActive
                  ? "bg-white text-slate-900 shadow-lg translate-y-0"
                  : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted translate-y-1"
              )}
              style={isActive ? { borderTopColor: tab.color } : undefined}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="bg-white border rounded-b-lg rounded-tr-lg shadow-xl p-8 min-h-[300px]">
        <div className="animate-in fade-in duration-200">
          {/* Header com título e botão de novo produto */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <h2
              className="text-3xl font-bold flex items-center gap-3"
              style={{ color: currentTab?.color }}
            >
              {active === "info" && (
                <FileText
                  className="w-8 h-8"
                  style={{ color: currentTab?.color }}
                />
              )}
              {active === "lab" && (
                <FlaskConical
                  className="w-8 h-8"
                  style={{ color: currentTab?.color }}
                />
              )}
              {active === "chemicals" && (
                <TestTube
                  className="w-8 h-8"
                  style={{ color: currentTab?.color }}
                />
              )}
              {currentTab.label}
            </h2>

            <button
              title="Registrar novo produto"
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md text-gray-700 hover:text-slate-900 hover:bg-slate-100 transition border"
            >
              <Plus size={16} />
              Novo produto
            </button>
          </div>

          {children ? (
            children
          ) : (
            <>
              {active === "info" && (
                <div className="text-sm text-muted-foreground">
                  Área de informações principais (sem conteúdo detalhado).
                </div>
              )}

              {/* LAB FORM */}
              {active === "lab" && (
                <div className="space-y-4">
                  <form
                    onSubmit={handleLabSubmit}
                    className="bg-folder-bg p-6 rounded-lg border border-gray-200"
                  >
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-sm text-gray-600 mb-1 block">
                          Nome do produto
                        </label>
                        <Input
                          placeholder="Ex: Reagente X"
                          value={labForm.name}
                          onChange={(e) =>
                            setLabForm((s) => ({ ...s, name: e.target.value }))
                          }
                          required
                        />
                        {labErrors.name && (
                          <div className="text-xs text-red-600 mt-1">
                            {labErrors.name}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-[120px]">
                        <label className="text-sm text-gray-600 mb-1 block">
                          Quantidade
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          value={labForm.qty}
                          onChange={(e) =>
                            setLabForm((s) => ({ ...s, qty: e.target.value }))
                          }
                          required
                        />
                        {labErrors.qty && (
                          <div className="text-xs text-red-600 mt-1">
                            {labErrors.qty}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-[150px]">
                        <label className="text-sm text-gray-600 mb-1 block">
                          Tipo de Movimento
                        </label>
                        <select
                          value={labForm.movementType}
                          onChange={(e) =>
                            setLabForm((s) => ({
                              ...s,
                              movementType: e.target.value,
                              movement_date:
                                e.target.value === "consumo"
                                  ? s.movement_date || todayISO()
                                  : s.movement_date,
                              request_date:
                                e.target.value === "entrada"
                                  ? s.request_date || todayISO()
                                  : s.request_date,
                            }))
                          }
                          className="w-full border border-slate-300 outline-slate-400 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          <option value="consumo">Consumo</option>
                          <option value="entrada">Entrada</option>
                        </select>
                      </div>

                      {/* date fields - now in same row */}
                      {labForm.movementType === "consumo" ? (
                        <div className="flex-1 min-w-[150px]">
                          <label className="text-sm text-gray-600 mb-1 block">
                            Data de consumo
                          </label>
                          <Input
                            type="date"
                            value={labForm.movement_date}
                            onChange={(e) =>
                              setLabForm((s) => ({
                                ...s,
                                movement_date: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-[150px]">
                            <label className="text-sm text-gray-600 mb-1 block">
                              Data de solicitação
                            </label>
                            <Input
                              type="date"
                              value={labForm.request_date}
                              onChange={(e) =>
                                setLabForm((s) => ({
                                  ...s,
                                  request_date: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="flex-1 min-w-[150px]">
                            <label className="text-sm text-gray-600 mb-1 block">
                              Data de chegada
                            </label>
                            <Input
                              type="date"
                              value={labForm.arrival_date}
                              onChange={(e) =>
                                setLabForm((s) => ({
                                  ...s,
                                  arrival_date: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </>
                      )}

                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-3 justify-end h-[42px]">
                          {labSuccess && (
                            <div className="text-sm px-3 py-1 rounded bg-green-50 text-green-700">
                              Registrado
                            </div>
                          )}
                          <Button
                            type="submit"
                            disabled={!isFormValid(labForm)}
                            icon={<PlusCircle size={16} />}
                          >
                            Registrar
                          </Button>
                        </div>
                      </div>
                    </div>

                    {labErrors.dates && (
                      <div className="text-xs text-red-600 mt-3">
                        {labErrors.dates}
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* CHEMICALS FORM */}
              {active === "chemicals" && (
                <div className="space-y-4">
                  <form
                    onSubmit={handleChemSubmit}
                    className="bg-folder-bg p-6 rounded-lg border border-gray-200"
                  >
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-sm text-gray-600 mb-1 block">
                          Nome do produto
                        </label>
                        <Input
                          placeholder="Ex: Produto X"
                          value={chemForm.name}
                          onChange={(e) =>
                            setChemForm((s) => ({ ...s, name: e.target.value }))
                          }
                          required
                        />
                        {chemErrors.name && (
                          <div className="text-xs text-red-600 mt-1">
                            {chemErrors.name}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-[120px]">
                        <label className="text-sm text-gray-600 mb-1 block">
                          Quantidade
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          value={chemForm.qty}
                          onChange={(e) =>
                            setChemForm((s) => ({ ...s, qty: e.target.value }))
                          }
                          required
                        />
                        {chemErrors.qty && (
                          <div className="text-xs text-red-600 mt-1">
                            {chemErrors.qty}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-[150px]">
                        <label className="text-sm text-gray-600 mb-1 block">
                          Tipo de Movimento
                        </label>
                        <select
                          value={chemForm.movementType}
                          onChange={(e) =>
                            setChemForm((s) => ({
                              ...s,
                              movementType: e.target.value,
                              movement_date:
                                e.target.value === "consumo"
                                  ? s.movement_date || todayISO()
                                  : s.movement_date,
                              request_date:
                                e.target.value === "entrada"
                                  ? s.request_date || todayISO()
                                  : s.request_date,
                            }))
                          }
                          className="w-full border border-slate-300 outline-slate-400 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          <option value="consumo">Consumo</option>
                          <option value="entrada">Entrada</option>
                        </select>
                      </div>

                      {chemForm.movementType === "consumo" ? (
                        <div className="flex-1 min-w-[150px]">
                          <label className="text-sm text-gray-600 mb-1 block">
                            Data de consumo
                          </label>
                          <Input
                            type="date"
                            value={chemForm.movement_date}
                            onChange={(e) =>
                              setChemForm((s) => ({
                                ...s,
                                movement_date: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-[150px]">
                            <label className="text-sm text-gray-600 mb-1 block">
                              Data de solicitação
                            </label>
                            <Input
                              type="date"
                              value={chemForm.request_date}
                              onChange={(e) =>
                                setChemForm((s) => ({
                                  ...s,
                                  request_date: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="flex-1 min-w-[150px]">
                            <label className="text-sm text-gray-600 mb-1 block">
                              Data de chegada
                            </label>
                            <Input
                              type="date"
                              value={chemForm.arrival_date}
                              onChange={(e) =>
                                setChemForm((s) => ({
                                  ...s,
                                  arrival_date: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </>
                      )}

                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-3 justify-end h-[42px]">
                          {chemSuccess && (
                            <div className="text-sm px-3 py-1 rounded bg-green-50 text-green-700">
                              Registrado
                            </div>
                          )}
                          <Button
                            type="submit"
                            icon={<PlusCircle size={16} />}
                            disabled={!isFormValid(chemForm)}
                          >
                            Registrar
                          </Button>
                        </div>
                      </div>
                    </div>

                    {chemErrors.dates && (
                      <div className="text-xs text-red-600 mt-3">
                        {chemErrors.dates}
                      </div>
                    )}
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* New product modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl p-6 relative">
            <button
              aria-label="Fechar"
              onClick={() => setIsNewModalOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-md text-slate-600 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <PlusCircle size={24} className="text-secondary" />
              <h3 className="text-lg font-bold">Registrar novo produto</h3>
            </div>

            <form onSubmit={handleNewProductSave} className="space-y-4">
              <div>
                <Input
                  label="Nome do produto"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct((s) => ({ ...s, name: e.target.value }))
                  }
                  required
                  placeholder="Ex: Reagente X"
                />
                {newProductErrors.name && (
                  <div className="text-xs text-red-600 mt-1">
                    {newProductErrors.name}
                  </div>
                )}
              </div>

              <div>
                <Input
                  label="Unidade"
                  value={newProduct.unid}
                  onChange={(e) =>
                    setNewProduct((s) => ({ ...s, unid: e.target.value }))
                  }
                  required
                  placeholder="kg, L, un, etc."
                />
                {newProductErrors.unid && (
                  <div className="text-xs text-red-600 mt-1">
                    {newProductErrors.unid}
                  </div>
                )}
              </div>

              <Input
                label="Código RM"
                value={newProduct.codRM}
                onChange={(e) =>
                  setNewProduct((s) => ({ ...s, codRM: e.target.value }))
                }
                placeholder="XXX.XXX.XXX"
              />

              <Input
                label="Custo Unitário"
                value={newProduct.cost}
                onChange={(e) =>
                  setNewProduct((s) => ({ ...s, cost: e.target.value }))
                }
                placeholder="R$ 0.00"
              />

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Classificação
                </label>
                <select
                  value={newProduct.classification}
                  onChange={(e) =>
                    setNewProduct((s) => ({
                      ...s,
                      classification: e.target.value,
                      department: "",
                    }))
                  }
                  className="w-full border border-slate-300 outline-slate-400 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="Reagentes">Reagentes</option>
                  <option value="Materiais">Materiais</option>
                  <option value="Insumo da Usina">Insumo da Usina</option>
                </select>
              </div>

              {newProduct.classification === "Insumo da Usina" && (
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Departamento
                  </label>
                  <select
                    value={newProduct.department}
                    onChange={(e) =>
                      setNewProduct((s) => ({
                        ...s,
                        department: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-300 outline-slate-400 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Selecione um departamento</option>
                    <option value="Destilaria">Destilaria</option>
                    <option value="Fábrica">Fábrica</option>
                    <option value="Caldeira">Caldeira</option>
                    <option value="ETA">ETA</option>
                  </select>
                  {newProductErrors.department && (
                    <div className="text-xs text-red-600 mt-1">
                      {newProductErrors.department}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  className="px-3 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-50 transition"
                  onClick={() => console.log("Abrir fluxo de edição (futuro)")}
                >
                  Futuro: editar existente
                </button>

                <div className="flex items-center gap-2">
                  {newProductSuccess && (
                    <div className="text-sm px-3 py-1 rounded bg-green-50 text-green-700">
                      Produto criado!
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="px-3 py-2 rounded-md text-sm border hover:bg-slate-50 transition"
                  >
                    Cancelar
                  </button>
                  <Button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-secondary text-white hover:opacity-95 transition"
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
