import { useState } from "react";
import Seo from "../components/Seo.jsx";
import DemoOnglets from "../demo/DemoOnglets.jsx";
import Courbe from "../demo/Courbe.jsx";
import useSimulation from "../demo/useSimulation.js";
import { creerEtat, etape, synthese, tableaux, basculerDepart, formaterHeure } from "../demo/simulationComptage.js";
import { useLangue } from "../i18n/Langue.jsx";

const TX = {
  fr: {
    surtitre: "Démo interactive · données simulées",
    titreA: "Supervision", titreB: "du comptage",
    intro: "Site logistique à Roissy : 55 compteurs électriques à impulsions, remontés par 4 automates Modicon M221 vers EcoStruxure Building Operation. Chaque compteur correspond à un mot %MD. Cliquez sur un départ pour voir son détail.",
    heure: "Heure", vitesse: "Vitesse", pause: "Pause", reprendre: "Reprendre",
    puissance: "Puissance appelée", mesuree: "vue par la GTB", energie: "Énergie depuis 06:30",
    communicants: "Compteurs qui comptent", ouverts: "Départs ouverts",
    architecture: "Architecture", aspTitre: "AS-P · EcoStruxure EBO", comOk: "COM OK",
    tous: "Tous les TD", filtreStatut: "Statut",
    statuts: { tous: "Tous", compte: "Compte", nonCompte: "Ne compte pas", progHoraire: "Prog. horaire" },
    ouvert: "Ouvert",
    detail: "Détail du compteur", choisir: "Sélectionnez un départ dans un tableau.",
    automate: "Automate", entree: "Entrée", index: "Index", conso: "Conso depuis 06:30",
    remarque: "Remarque",
    remarqueNon: "Index %MD figé : le compteur n'a jamais compté. Vérifier le câblage de l'entrée impulsion et la configuration côté M221, sans modifier le programme.",
    remarqueProg: "Éclairage extérieur piloté par programmation horaire (allumé de 17h15 à 7h45).",
    ouvrir: "Ouvrir le départ", fermer: "Refermer le départ", simulation: "Action simulée : aucun équipement réel n'est piloté.",
    courbe: "Courbe de charge du site (6 dernières heures)",
    autocontrole: "Autocontrôle du comptage",
    autocontroleIntro: "Méthode : Machine Expert Basic en ligne sur chaque M221, sans transfert, en vérifiant que le %MD augmente.",
    colonnes: ["AS-P", "M221", "Compteur", "Entrée", "%MD (kWh)", "Compte ?", "Remarque"],
    oui: "Oui", non: "Non", prog: "Prog horaire", remarqueCourte: "Jamais compté — vérifier câblage impulsion",
    journal: "Journal",
    jOuvert: (n) => `Départ ouvert : ${n}`, jFerme: (n) => `Départ refermé : ${n}`,
  },
  en: {
    surtitre: "Interactive demo · simulated data",
    titreA: "Metering", titreB: "supervision",
    intro: "Logistics site near Roissy: 55 pulse electricity meters, read by 4 Modicon M221 PLCs and sent to EcoStruxure Building Operation. Each meter maps to a %MD word. Click a circuit to see its details.",
    heure: "Time", vitesse: "Speed", pause: "Pause", reprendre: "Resume",
    puissance: "Power demand", mesuree: "seen by the BMS", energie: "Energy since 06:30",
    communicants: "Meters counting", ouverts: "Open circuits",
    architecture: "Architecture", aspTitre: "AS-P · EcoStruxure EBO", comOk: "COM OK",
    tous: "All panels", filtreStatut: "Status",
    statuts: { tous: "All", compte: "Counting", nonCompte: "Not counting", progHoraire: "Time schedule" },
    ouvert: "Open",
    detail: "Meter details", choisir: "Select a circuit in a panel.",
    automate: "PLC", entree: "Input", index: "Index", conso: "Usage since 06:30",
    remarque: "Note",
    remarqueNon: "%MD index frozen: this meter has never counted. Check the pulse input wiring and the M221 configuration, without changing the program.",
    remarqueProg: "Outdoor lighting controlled by a time schedule (on from 5:15 pm to 7:45 am).",
    ouvrir: "Open the circuit", fermer: "Close the circuit", simulation: "Simulated action: no real equipment is controlled.",
    courbe: "Site load curve (last 6 hours)",
    autocontrole: "Metering self-check",
    autocontroleIntro: "Method: Machine Expert Basic online on each M221, with no transfer, checking that the %MD increases.",
    colonnes: ["AS-P", "M221", "Meter", "Input", "%MD (kWh)", "Counting?", "Note"],
    oui: "Yes", non: "No", prog: "Time schedule", remarqueCourte: "Never counted — check pulse wiring",
    journal: "Log",
    jOuvert: (n) => `Circuit opened: ${n}`, jFerme: (n) => `Circuit closed: ${n}`,
  },
};

function Module({ c, selection, onClick, langue, tx }) {
  const allume = c.puissance > 0.05;
  const etatLed = !c.ferme ? "eteint" : c.statut === "nonCompte" ? "defaut" : c.statut === "progHoraire" ? (allume ? "ok" : "attente") : "ok";
  // la LED "impulsion" clignote plus vite quand la puissance est forte
  const periode = etatLed === "ok" ? Math.max(0.25, 2.5 - c.puissance / 3) : 0;
  return (
    <button
      className={`module ${selection ? "selection" : ""} ${c.ferme ? "" : "ouvert"}`}
      onClick={onClick}
      aria-pressed={selection}
      title={`${c.id} · ${c.nom[langue]}`}
    >
      <span className={`led ${etatLed}`} style={periode ? { animationDuration: `${periode}s` } : undefined} aria-hidden="true" />
      <span className="levier" aria-hidden="true"><span /></span>
      <span className="module-id mono">{c.id}</span>
      <span className="module-nom">{c.nom[langue]}</span>
      <span className="module-kw mono">{c.ferme ? (c.statut === "nonCompte" ? "— kW" : `${c.puissance.toFixed(1)} kW`) : tx.ouvert}</span>
    </button>
  );
}

export default function DemoComptage() {
  const { langue } = useLangue();
  const tx = TX[langue];
  const { sim, vitesse, setVitesse, enPause, setPause, actualiser } = useSimulation(creerEtat, etape, { intervalle: 500 });
  const [tableauActif, setTableauActif] = useState("tous");
  const [statut, setStatut] = useState("tous");
  const [selection, setSelection] = useState("C1-14");

  const s = synthese(sim);
  const tabs = tableaux();
  const visibles = tabs.filter((t) => tableauActif === "tous" || t.id === tableauActif);
  const c = sim.compteurs.find((x) => x.id === selection);
  const tabSel = c ? tabs.find((t) => t.id === c.tableau) : null;
  const statutVisible = (x) => statut === "tous" || x.statut === statut;
  const lignesAutocontrole = sim.compteurs.filter((x) => (tableauActif === "tous" || x.tableau === tableauActif) && statutVisible(x));

  return (
    <div className="container page-haut demo">
      <Seo titre={`${tx.titreA} ${tx.titreB}`} description={tx.intro} />
      <header className="page-tete">
        <p className="surtitre mono entree" style={{ "--i": 0 }}>{tx.surtitre}</p>
        <h1 className="entree" style={{ "--i": 1 }}>{tx.titreA} <span className="degrade">{tx.titreB}</span></h1>
        <p className="intro entree" style={{ "--i": 2 }}>{tx.intro}</p>
      </header>

      <DemoOnglets />

      {/* ===== Indicateurs ===== */}
      <div className="kpis">
        <div className="card kpi">
          <span className="label-doux">{tx.puissance}</span>
          <strong className="mono">{s.total.toFixed(1)} <small>kW</small></strong>
          <span className="label-doux petit">{s.mesure.toFixed(1)} kW {tx.mesuree}</span>
        </div>
        <div className="card kpi">
          <span className="label-doux">{tx.energie}</span>
          <strong className="mono">{Math.round(s.energie).toLocaleString(langue)} <small>kWh</small></strong>
          <span className="label-doux petit">{tx.heure} {formaterHeure(sim.minutes)}</span>
        </div>
        <div className={`card kpi ${s.nonComptant.length ? "kpi-alerte" : ""}`}>
          <span className="label-doux">{tx.communicants}</span>
          <strong className="mono">{s.comptant} <small>/ {sim.compteurs.length}</small></strong>
          <span className="label-doux petit">{s.nonComptant.map((x) => x.id).join(" · ")}</span>
        </div>
        <div className="card kpi">
          <span className="label-doux">{tx.ouverts}</span>
          <strong className="mono">{s.ouverts}</strong>
          <div className="segment segment-mini" role="group" aria-label={tx.vitesse}>
            <button onClick={() => setPause(!enPause)} aria-label={enPause ? tx.reprendre : tx.pause}>{enPause ? "▶" : "❚❚"}</button>
            {[1, 5, 15].map((v) => (
              <button key={v} className={vitesse === v && !enPause ? "actif" : ""} aria-pressed={vitesse === v} onClick={() => { setVitesse(v); setPause(false); }}>×{v}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Architecture : AS-P -> M221 ===== */}
      <div className="card architecture">
        <span className="label-doux mono">{tx.architecture}</span>
        <div className="archi-schema">
          <div className="archi-asp mono">{tx.aspTitre}</div>
          <div className="archi-liens">
            <button className={`archi-automate ${tableauActif === "tous" ? "actif" : ""}`} onClick={() => setTableauActif("tous")}>
              <strong>{tx.tous}</strong>
              <span className="mono">{s.total.toFixed(1)} kW</span>
            </button>
            {tabs.map((t) => (
              <button key={t.id} className={`archi-automate ${tableauActif === t.id ? "actif" : ""}`} onClick={() => setTableauActif(t.id)}>
                <strong>{t.automate}</strong>
                <span className="mono">{s.parTableau[t.id].toFixed(1)} kW</span>
                <span className="com mono">● {tx.comOk}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="segment" role="group" aria-label={tx.filtreStatut}>
          {Object.keys(tx.statuts).map((k) => (
            <button key={k} className={statut === k ? "actif" : ""} aria-pressed={statut === k} onClick={() => setStatut(k)}>
              {k !== "tous" && <span className={`led-mini ${k}`} aria-hidden="true" />} {tx.statuts[k]}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Tableaux électriques + détail ===== */}
      <div className="comptage-grille">
        <div className="armoires">
          {visibles.map((t) => (
            <section key={t.id} className="armoire">
              <header className="armoire-plaque">
                <span>{t.td[langue]}</span>
                <span className="mono">{t.automate} · {s.parTableau[t.id].toFixed(1)} kW</span>
              </header>
              <div className="rail">
                {sim.compteurs.filter((x) => x.tableau === t.id && statutVisible(x)).map((x) => (
                  <Module key={x.id} c={x} tx={tx} langue={langue} selection={selection === x.id} onClick={() => setSelection(x.id)} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="card detail-compteur">
          <h3>{tx.detail}</h3>
          {!c ? (
            <p className="label-doux">{tx.choisir}</p>
          ) : (
            <>
              <p className="mono label-doux">{c.id}</p>
              <h2 className="panneau-titre">{c.nom[langue]}</h2>
              <span className={`badge-statut ${c.statut}`}>{tx.statuts[c.statut]}</span>
              <dl className="caracteristiques">
                <dt>{tx.automate}</dt><dd className="mono">{tabSel.automate}</dd>
                <dt>{tx.entree}</dt><dd className="mono">{c.entree}</dd>
                <dt>{tx.puissance}</dt><dd className="mono">{c.ferme && c.statut !== "nonCompte" ? `${c.puissance.toFixed(2)} kW` : "—"}</dd>
                <dt>{tx.conso}</dt><dd className="mono">{(c.index - c.indexDepart).toFixed(1)} kWh</dd>
              </dl>
              <div className="afficheur-grand mono" aria-label={tx.index}>
                {c.index.toFixed(1).padStart(9, "0")} <small>kWh</small>
              </div>
              <Courbe valeurs={c.historique} hauteur={60} couleur={c.statut === "nonCompte" ? "#ef4444" : "var(--accent)"} etiquette={c.nom[langue]} />
              {c.statut !== "compte" && (
                <p className={`remarque ${c.statut}`}><strong>{tx.remarque} : </strong>{c.statut === "nonCompte" ? tx.remarqueNon : tx.remarqueProg}</p>
              )}
              <button className="btn btn-contour btn-petit" onClick={() => { basculerDepart(sim, c.id); actualiser(); }}>
                {c.ferme ? tx.ouvrir : tx.fermer}
              </button>
              <p className="label-doux petit">{tx.simulation}</p>
              {sim.journal.length > 0 && (
                <ul className="journal">
                  {sim.journal.slice(0, 4).map((e, i) => {
                    const n = sim.compteurs.find((x) => x.id === e.id).nom[langue];
                    return <li key={i}><span className="mono">{e.heure}</span> {e.ferme ? tx.jFerme(n) : tx.jOuvert(n)}</li>;
                  })}
                </ul>
              )}
            </>
          )}
        </aside>
      </div>

      {/* ===== Courbe de charge + tableau d'autocontrôle ===== */}
      <div className="card">
        <h3>{tx.courbe}</h3>
        <Courbe valeurs={sim.historique} hauteur={110} etiquette={tx.courbe} />
      </div>

      <div className="card autocontrole">
        <h3>{tx.autocontrole}</h3>
        <p className="label-doux">{tx.autocontroleIntro}</p>
        <div className="table-defilante">
          <table>
            <thead>
              <tr>{tx.colonnes.map((col) => <th key={col}>{col}</th>)}</tr>
            </thead>
            <tbody>
              {lignesAutocontrole.map((x) => (
                <tr key={x.id} className={selection === x.id ? "selection" : ""} onClick={() => setSelection(x.id)}>
                  <td className="mono">AS-P</td>
                  <td>{tabs.find((t) => t.id === x.tableau).automate}</td>
                  <td>{x.nom[langue]}</td>
                  <td className="mono">{x.entree}</td>
                  <td className="mono">{x.index.toFixed(1)}</td>
                  <td><span className={`badge-statut ${x.statut}`}>{x.statut === "compte" ? tx.oui : x.statut === "nonCompte" ? tx.non : tx.prog}</span></td>
                  <td>{x.statut === "nonCompte" ? tx.remarqueCourte : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
