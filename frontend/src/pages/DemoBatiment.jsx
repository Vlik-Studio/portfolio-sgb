import { useState } from "react";
import Seo from "../components/Seo.jsx";
import DemoOnglets from "../demo/DemoOnglets.jsx";
import Batiment3D, { couleurCo2 } from "../demo/Batiment3D.jsx";
import Courbe from "../demo/Courbe.jsx";
import useSimulation from "../demo/useSimulation.js";
import {
  ZONES, USAGES, SEUIL_CO2, creerEtat, etape, commander, appliquerScenario, acquitterAlarmes, formaterHeure,
} from "../demo/simulationGtb.js";
import { useLangue } from "../i18n/Langue.jsx";

const TX = {
  fr: {
    surtitre: "Démo interactive · données simulées",
    titreA: "Bâtiment", titreB: "GTB en 3D",
    intro: "Une GTB qui tourne vraiment : chaque zone régule sa température, sa qualité d'air, son éclairage et ses stores. Prenez la main sur les équipements et observez les sondes et les compteurs réagir.",
    aria: "Bâtiment en 3D de trois niveaux et six zones, avec éclairage, stores, CVC et sondes",
    aide: "Glissez pour tourner · cliquez sur une zone pour la piloter",
    heure: "Heure", ext: "Ext.", soleil: "Soleil",
    scenario: "Scénario", confort: "Confort", eco: "Éco", inoccupation: "Inoccupation",
    pause: "Pause", reprendre: "Reprendre", vitesse: "Vitesse",
    zone: "Zone", temperature: "Température", co2: "CO₂", occupants: "Occupants",
    planning: "Planning", forcer: "Occupation forcée",
    eclairage: "Éclairage", stores: "Stores", cvc: "CVC", ventilation: "Ventilation (CTA)",
    auto: "Auto", manuel: "Manuel",
    arret: "Arrêt", chaud: "Chaud", froid: "Froid",
    consigne: "Consigne", reduit: "réduit la nuit (17 °C)",
    ferme: "fermé", allume: "allumé", debit: "débit",
    comptage: "Comptage par usage", puissance: "Puissance", index: "Index",
    usages: { eclairage: "Éclairage", cvc: "CVC", ventilation: "Ventilation", prises: "Prises" },
    total: "Total", courbe: "Courbe de charge (3 dernières heures)",
    alarmes: "Alarmes", aucune: "Aucune alarme active", acquitter: "Acquitter",
    alarmeTxt: { co2: "CO₂ élevé", tempBasse: "Température basse", tempHaute: "Température haute" },
    journal: "Journal d'événements", vide: "Aucun événement pour l'instant",
    legende: { lum: "Éclairage", chaud: "Chauffage", froid: "Froid", co2: "Sonde CO₂ (vert < 800, orange < 1000, rouge ≥ 1000 ppm)" },
    j: {
      alarme: (z, a) => `ALARME ${a} — ${z}`,
      retour: (z, a) => `Retour à la normale : ${a} — ${z}`,
      scenario: (s) => `Scénario ${s} activé`,
      acquit: () => "Alarmes acquittées",
      commande: (z, c, v) => `Commande ${c} : ${v} — ${z}`,
    },
    champs: { eclairage: "éclairage", eclairageAuto: "éclairage auto", storeCible: "store", storeAuto: "store auto", cvc: "CVC", consigne: "consigne", ventil: "ventilation", ventilAuto: "ventilation auto", occupantsForces: "occupation" },
    valeurs: { true: "oui", false: "non", null: "planning", arret: "arrêt", auto: "auto", chaud: "chaud", froid: "froid" },
  },
  en: {
    surtitre: "Interactive demo · simulated data",
    titreA: "3D", titreB: "BMS building",
    intro: "A BMS that really runs: each zone controls its temperature, air quality, lighting and blinds. Take over the equipment and watch the sensors and meters react.",
    aria: "3D building with three floors and six zones, with lighting, blinds, HVAC and sensors",
    aide: "Drag to rotate · click a zone to control it",
    heure: "Time", ext: "Outdoor", soleil: "Sun",
    scenario: "Scenario", confort: "Comfort", eco: "Eco", inoccupation: "Unoccupied",
    pause: "Pause", reprendre: "Resume", vitesse: "Speed",
    zone: "Zone", temperature: "Temperature", co2: "CO₂", occupants: "Occupants",
    planning: "Schedule", forcer: "Forced occupancy",
    eclairage: "Lighting", stores: "Blinds", cvc: "HVAC", ventilation: "Ventilation (AHU)",
    auto: "Auto", manuel: "Manual",
    arret: "Off", chaud: "Heat", froid: "Cool",
    consigne: "Setpoint", reduit: "night setback (17 °C)",
    ferme: "closed", allume: "on", debit: "airflow",
    comptage: "Metering by end use", puissance: "Power", index: "Index",
    usages: { eclairage: "Lighting", cvc: "HVAC", ventilation: "Ventilation", prises: "Sockets" },
    total: "Total", courbe: "Load curve (last 3 hours)",
    alarmes: "Alarms", aucune: "No active alarm", acquitter: "Acknowledge",
    alarmeTxt: { co2: "High CO₂", tempBasse: "Low temperature", tempHaute: "High temperature" },
    journal: "Event log", vide: "No event yet",
    legende: { lum: "Lighting", chaud: "Heating", froid: "Cooling", co2: "CO₂ sensor (green < 800, orange < 1000, red ≥ 1000 ppm)" },
    j: {
      alarme: (z, a) => `ALARM ${a} — ${z}`,
      retour: (z, a) => `Back to normal: ${a} — ${z}`,
      scenario: (s) => `${s} scenario enabled`,
      acquit: () => "Alarms acknowledged",
      commande: (z, c, v) => `Command ${c}: ${v} — ${z}`,
    },
    champs: { eclairage: "lighting", eclairageAuto: "lighting auto", storeCible: "blind", storeAuto: "blind auto", cvc: "HVAC", consigne: "setpoint", ventil: "ventilation", ventilAuto: "ventilation auto", occupantsForces: "occupancy" },
    valeurs: { true: "yes", false: "no", null: "schedule", arret: "off", auto: "auto", chaud: "heat", froid: "cool" },
  },
};

function Interrupteur({ actif, onChange, libelle }) {
  return (
    <button type="button" className={`interrupteur ${actif ? "actif" : ""}`} aria-pressed={actif} onClick={() => onChange(!actif)}>
      <span className="interrupteur-curseur" aria-hidden="true" />
      {libelle}
    </button>
  );
}

function Commande({ titre, valeur, auto, onAuto, children, tx }) {
  return (
    <div className="commande">
      <div className="commande-tete">
        <span className="commande-titre">{titre}</span>
        <span className="mono commande-valeur">{valeur}</span>
        {onAuto && <Interrupteur actif={auto} onChange={onAuto} libelle={auto ? tx.auto : tx.manuel} />}
      </div>
      {children}
    </div>
  );
}

export default function DemoBatiment() {
  const { langue } = useLangue();
  const tx = TX[langue];
  const { simRef, sim, vitesse, setVitesse, enPause, setPause, actualiser } = useSimulation(creerEtat, etape);
  const [selection, setSelection] = useState("bureaux-nord");

  const def = ZONES.find((z) => z.id === selection);
  const z = sim.zones[selection];
  const nomZone = (id) => ZONES.find((d) => d.id === id).nom[langue];
  const agir = (champ, valeur) => { commander(sim, selection, champ, valeur); actualiser(); };
  const total = USAGES.reduce((s, u) => s + sim.puissances[u], 0);

  const texteJournal = (e) => {
    if (e.type === "alarme" || e.type === "retour") return tx.j[e.type](nomZone(e.zone), tx.alarmeTxt[e.alarme]);
    if (e.type === "scenario") return tx.j.scenario(tx[e.scenario]);
    if (e.type === "commande") {
      const v = tx.valeurs[String(e.valeur)] ?? e.valeur;
      const unite = e.champ === "consigne" ? " °C" : ["eclairage", "storeCible", "ventil"].includes(e.champ) ? " %" : "";
      return tx.j.commande(nomZone(e.zone), tx.champs[e.champ] ?? e.champ, `${v}${unite}`);
    }
    return tx.j.acquit();
  };

  return (
    <div className="container page-haut demo">
      <Seo titre={`${tx.titreA} ${tx.titreB}`} description={tx.intro} />
      <header className="page-tete">
        <p className="surtitre mono entree" style={{ "--i": 0 }}>{tx.surtitre}</p>
        <h1 className="entree" style={{ "--i": 1 }}>{tx.titreA} <span className="degrade">{tx.titreB}</span></h1>
        <p className="intro entree" style={{ "--i": 2 }}>{tx.intro}</p>
      </header>

      <DemoOnglets />

      {/* ===== Barre d'état ===== */}
      <div className="card demo-barre">
        <div className="demo-barre-infos mono">
          <span><span className="label-doux">{tx.heure}</span> <strong>{formaterHeure(sim.minutes)}</strong></span>
          <span><span className="label-doux">{tx.ext}</span> {sim.text.toFixed(1)} °C</span>
          <span><span className="label-doux">{tx.soleil}</span> {Math.round(sim.soleil * 100)} %</span>
        </div>
        <div className="demo-barre-actions">
          <div className="segment" role="group" aria-label={tx.scenario}>
            {["confort", "eco", "inoccupation"].map((s) => (
              <button key={s} className={sim.scenario === s ? "actif" : ""} aria-pressed={sim.scenario === s}
                onClick={() => { appliquerScenario(sim, s); actualiser(); }}>{tx[s]}</button>
            ))}
          </div>
          <div className="segment" role="group" aria-label={tx.vitesse}>
            <button onClick={() => setPause(!enPause)} aria-label={enPause ? tx.reprendre : tx.pause}>{enPause ? "▶" : "❚❚"}</button>
            {[1, 4, 12].map((v) => (
              <button key={v} className={vitesse === v && !enPause ? "actif" : ""} aria-pressed={vitesse === v}
                onClick={() => { setVitesse(v); setPause(false); }}>×{v}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Scène 3D + panneau de commande ===== */}
      <div className="demo-grille">
        <div className="card demo-scene">
          <Batiment3D simRef={simRef} selection={selection} onSelection={setSelection} langue={langue} aria={tx.aria} />
          <p className="demo-aide mono">{tx.aide}</p>
          <ul className="legende">
            <li><span className="pastille" style={{ background: "#ffd36b" }} />{tx.legende.lum}</li>
            <li><span className="pastille" style={{ background: "#ff6b4a" }} />{tx.legende.chaud}</li>
            <li><span className="pastille" style={{ background: "#4aa8ff" }} />{tx.legende.froid}</li>
            <li><span className="pastille" style={{ background: "#22c55e" }} />{tx.legende.co2}</li>
          </ul>
        </div>

        <aside className="card demo-panneau">
          <div className="zones-choix" role="group" aria-label={tx.zone}>
            {ZONES.map((d) => (
              <button key={d.id} className={selection === d.id ? "actif" : ""} aria-pressed={selection === d.id} onClick={() => setSelection(d.id)}>
                <span className="mono">R+{d.etage}</span> {d.nom[langue]}
                {sim.alarmes.some((a) => a.zone === d.id) && <span className="point-alarme" aria-hidden="true" />}
              </button>
            ))}
          </div>

          <h2 className="panneau-titre">{def.nom[langue]}</h2>

          <div className="mesures">
            <div className="mesure-tuile">
              <span className="label-doux">{tx.temperature}</span>
              <strong className="mono">{z.temp.toFixed(1)} °C</strong>
            </div>
            <div className="mesure-tuile" style={{ "--c": couleurCo2(z.co2) }}>
              <span className="label-doux">{tx.co2}</span>
              <strong className="mono co2">{Math.round(z.co2)} ppm</strong>
              <span className="jauge-co2"><span style={{ width: `${Math.min(100, (z.co2 / 1600) * 100)}%` }} /></span>
            </div>
            <div className="mesure-tuile">
              <span className="label-doux">{tx.occupants}</span>
              <div className="occupants">
                <button onClick={() => agir("occupantsForces", Math.max(0, (z.occupantsForces ?? z.occupants) - 1))} aria-label="−1">−</button>
                <strong className="mono">{z.occupants}</strong>
                <button onClick={() => agir("occupantsForces", Math.min(def.capacite + 6, (z.occupantsForces ?? z.occupants) + 1))} aria-label="+1">+</button>
              </div>
              {z.occupantsForces !== null && (
                <button className="lien-bouton" onClick={() => agir("occupantsForces", null)}>↺ {tx.planning}</button>
              )}
            </div>
          </div>

          <Commande tx={tx} titre={tx.eclairage} valeur={z.eclairage > 0 ? `${z.eclairage} %` : "—"} auto={z.eclairageAuto} onAuto={(v) => agir("eclairageAuto", v)}>
            <input type="range" min="0" max="100" step="10" value={z.eclairage} aria-label={tx.eclairage} onChange={(e) => agir("eclairage", Number(e.target.value))} />
          </Commande>

          <Commande tx={tx} titre={tx.stores} valeur={`${Math.round(z.store)} % ${tx.ferme}`} auto={z.storeAuto} onAuto={(v) => agir("storeAuto", v)}>
            <input type="range" min="0" max="100" step="10" value={z.storeAuto ? Math.round(z.store) : z.storeCible} aria-label={tx.stores} onChange={(e) => agir("storeCible", Number(e.target.value))} />
          </Commande>

          <Commande tx={tx} titre={tx.cvc} valeur={z.demandeChaud > 0.02 ? `▲ ${Math.round(z.demandeChaud * 100)} %` : z.demandeFroid > 0.02 ? `▼ ${Math.round(z.demandeFroid * 100)} %` : "—"}>
            <div className="segment segment-plein" role="group" aria-label={tx.cvc}>
              {["arret", "auto", "chaud", "froid"].map((m) => (
                <button key={m} className={z.cvc === m ? "actif" : ""} aria-pressed={z.cvc === m} onClick={() => agir("cvc", m)}>{tx[m]}</button>
              ))}
            </div>
            <div className="consigne">
              <span className="label-doux">{tx.consigne}</span>
              <button onClick={() => agir("consigne", Math.max(15, z.consigne - 0.5))} aria-label="−0,5 °C">−</button>
              <strong className="mono">{z.consigne.toFixed(1)} °C</strong>
              <button onClick={() => agir("consigne", Math.min(26, z.consigne + 0.5))} aria-label="+0,5 °C">+</button>
              {z.cvc === "auto" && <span className="label-doux petit">{tx.reduit}</span>}
            </div>
          </Commande>

          <Commande tx={tx} titre={tx.ventilation} valeur={`${z.ventil} % ${tx.debit}`} auto={z.ventilAuto} onAuto={(v) => agir("ventilAuto", v)}>
            <input type="range" min="0" max="100" step="10" value={z.ventil} aria-label={tx.ventilation} onChange={(e) => agir("ventil", Number(e.target.value))} />
          </Commande>
        </aside>
      </div>

      {/* ===== Comptage, alarmes, journal ===== */}
      <div className="demo-bas">
        <div className="card">
          <h3>{tx.comptage}</h3>
          <ul className="compteurs-usage">
            {USAGES.map((u) => (
              <li key={u}>
                <span>{tx.usages[u]}</span>
                <span className="mono kw">{sim.puissances[u].toFixed(2)} kW</span>
                <span className="afficheur mono" title={tx.index}>{sim.index[u].toFixed(1).padStart(8, "0")} kWh</span>
              </li>
            ))}
            <li className="total">
              <span>{tx.total}</span>
              <span className="mono kw">{total.toFixed(2)} kW</span>
              <span />
            </li>
          </ul>
          <p className="label-doux petit">{tx.courbe}</p>
          <Courbe valeurs={sim.historique} etiquette={tx.courbe} />
        </div>

        <div className="card">
          <div className="carte-tete">
            <h3>{tx.alarmes} <span className={`badge-nb ${sim.alarmes.length ? "rouge" : ""}`}>{sim.alarmes.length}</span></h3>
            {sim.alarmes.some((a) => !a.acquittee) && (
              <button className="btn btn-contour btn-petit" onClick={() => { acquitterAlarmes(sim); actualiser(); }}>{tx.acquitter}</button>
            )}
          </div>
          {sim.alarmes.length === 0 ? (
            <p className="label-doux">✓ {tx.aucune}</p>
          ) : (
            <ul className="liste-alarmes">
              {sim.alarmes.map((a) => (
                <li key={a.id} className={a.acquittee ? "acquittee" : ""}>
                  <span className="mono">{a.heure}</span>
                  <strong>{tx.alarmeTxt[a.type]}</strong>
                  <span>{nomZone(a.zone)}{a.type === "co2" ? ` · ${Math.round(sim.zones[a.zone].co2)} ppm > ${SEUIL_CO2}` : ` · ${sim.zones[a.zone].temp.toFixed(1)} °C`}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3>{tx.journal}</h3>
          {sim.journal.length === 0 ? (
            <p className="label-doux">{tx.vide}</p>
          ) : (
            <ul className="journal">
              {sim.journal.slice(0, 8).map((e, i) => (
                <li key={`${e.heure}-${i}`} className={e.type}>
                  <span className="mono">{e.heure}</span> {texteJournal(e)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
