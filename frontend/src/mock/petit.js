// Données FACTICES générées à partir de data/petit/ et des résultats attendus
// (docs/PETIT_GRAPHE.md). Servent tant que l'API n'est pas branchée.
// Ne pas modifier à la main.

export const reseau = {
 "sites": [
  {
   "id": "C1",
   "nom": "Caserne Nord",
   "type": "caserne",
   "x": 1.2,
   "y": 4.8
  },
  {
   "id": "C2",
   "nom": "Caserne Est",
   "type": "caserne",
   "x": 8.6,
   "y": 4.4
  },
  {
   "id": "H1",
   "nom": "Hôpital Central",
   "type": "hopital",
   "x": 4.1,
   "y": 3.2
  },
  {
   "id": "E1",
   "nom": "École des Tilleuls",
   "type": "ecole",
   "x": 6.0,
   "y": 4.9
  },
  {
   "id": "T1",
   "nom": "Centre télécom",
   "type": "telecom",
   "x": 7.3,
   "y": 3.1
  },
  {
   "id": "Q1",
   "nom": "Quartier des Halles",
   "type": "quartier",
   "x": 2.4,
   "y": 4.1
  },
  {
   "id": "Q2",
   "nom": "Quartier du Port",
   "type": "quartier",
   "x": 2.1,
   "y": 2.3
  },
  {
   "id": "Q3",
   "nom": "Quartier des Forges",
   "type": "quartier",
   "x": 3.6,
   "y": 1.4
  },
  {
   "id": "Q4",
   "nom": "Quartier des Vignes",
   "type": "quartier",
   "x": 8.9,
   "y": 1.8
  },
  {
   "id": "Q5",
   "nom": "Quartier du Moulin",
   "type": "quartier",
   "x": 9.8,
   "y": 0.6
  }
 ],
 "routes": [
  {
   "u": "C1",
   "v": "Q1",
   "temps_normal": 4.0,
   "temps_pointe": 6.0,
   "statut": "ouvert"
  },
  {
   "u": "Q1",
   "v": "C1",
   "temps_normal": 4.0,
   "temps_pointe": 6.0,
   "statut": "ouvert"
  },
  {
   "u": "C1",
   "v": "Q2",
   "temps_normal": 7.0,
   "temps_pointe": 10.0,
   "statut": "ouvert"
  },
  {
   "u": "Q2",
   "v": "C1",
   "temps_normal": 7.0,
   "temps_pointe": 10.0,
   "statut": "ouvert"
  },
  {
   "u": "Q1",
   "v": "Q2",
   "temps_normal": 2.0,
   "temps_pointe": 3.0,
   "statut": "ouvert"
  },
  {
   "u": "Q1",
   "v": "H1",
   "temps_normal": 6.0,
   "temps_pointe": 9.0,
   "statut": "ouvert"
  },
  {
   "u": "H1",
   "v": "Q1",
   "temps_normal": 6.0,
   "temps_pointe": 9.0,
   "statut": "ouvert"
  },
  {
   "u": "Q2",
   "v": "Q3",
   "temps_normal": 3.0,
   "temps_pointe": 5.0,
   "statut": "ouvert"
  },
  {
   "u": "Q3",
   "v": "Q2",
   "temps_normal": 3.0,
   "temps_pointe": 5.0,
   "statut": "ouvert"
  },
  {
   "u": "Q3",
   "v": "H1",
   "temps_normal": 2.0,
   "temps_pointe": 4.0,
   "statut": "ouvert"
  },
  {
   "u": "H1",
   "v": "E1",
   "temps_normal": 5.0,
   "temps_pointe": 7.0,
   "statut": "ouvert"
  },
  {
   "u": "E1",
   "v": "H1",
   "temps_normal": 5.0,
   "temps_pointe": 7.0,
   "statut": "ouvert"
  },
  {
   "u": "Q3",
   "v": "E1",
   "temps_normal": 8.0,
   "temps_pointe": 11.0,
   "statut": "ouvert"
  },
  {
   "u": "E1",
   "v": "T1",
   "temps_normal": 3.0,
   "temps_pointe": 4.0,
   "statut": "ouvert"
  },
  {
   "u": "T1",
   "v": "E1",
   "temps_normal": 3.0,
   "temps_pointe": 4.0,
   "statut": "ouvert"
  },
  {
   "u": "C2",
   "v": "T1",
   "temps_normal": 4.0,
   "temps_pointe": 5.0,
   "statut": "ouvert"
  },
  {
   "u": "T1",
   "v": "C2",
   "temps_normal": 4.0,
   "temps_pointe": 5.0,
   "statut": "ouvert"
  },
  {
   "u": "C2",
   "v": "Q4",
   "temps_normal": 6.0,
   "temps_pointe": 8.0,
   "statut": "ouvert"
  },
  {
   "u": "Q4",
   "v": "C2",
   "temps_normal": 6.0,
   "temps_pointe": 8.0,
   "statut": "ouvert"
  },
  {
   "u": "Q5",
   "v": "Q4",
   "temps_normal": 3.0,
   "temps_pointe": 4.0,
   "statut": "ouvert"
  },
  {
   "u": "Q4",
   "v": "T1",
   "temps_normal": 9.0,
   "temps_pointe": 12.0,
   "statut": "ferme"
  }
 ],
 "fibre": [
  {
   "u": "C1",
   "v": "Q1",
   "cout": 3.0,
   "statut": "disponible"
  },
  {
   "u": "C1",
   "v": "Q2",
   "cout": 5.0,
   "statut": "disponible"
  },
  {
   "u": "Q1",
   "v": "Q2",
   "cout": 2.0,
   "statut": "disponible"
  },
  {
   "u": "Q1",
   "v": "H1",
   "cout": 4.0,
   "statut": "disponible"
  },
  {
   "u": "Q2",
   "v": "Q3",
   "cout": 3.0,
   "statut": "disponible"
  },
  {
   "u": "Q3",
   "v": "H1",
   "cout": 4.0,
   "statut": "disponible"
  },
  {
   "u": "H1",
   "v": "E1",
   "cout": 6.0,
   "statut": "disponible"
  },
  {
   "u": "Q3",
   "v": "E1",
   "cout": 7.0,
   "statut": "disponible"
  },
  {
   "u": "E1",
   "v": "T1",
   "cout": 2.0,
   "statut": "disponible"
  },
  {
   "u": "T1",
   "v": "C2",
   "cout": 3.0,
   "statut": "disponible"
  },
  {
   "u": "C2",
   "v": "Q4",
   "cout": 5.0,
   "statut": "disponible"
  },
  {
   "u": "Q4",
   "v": "Q5",
   "cout": 4.0,
   "statut": "disponible"
  },
  {
   "u": "T1",
   "v": "Q4",
   "cout": 8.0,
   "statut": "disponible"
  },
  {
   "u": "Q5",
   "v": "E1",
   "cout": 9.0,
   "statut": "indisponible"
  }
 ],
 "demandes": [
  {
   "id": "D1",
   "site": "Q4",
   "type": "incendie",
   "priorite": 1
  },
  {
   "id": "D2",
   "site": "Q3",
   "type": "malaise",
   "priorite": 2
  },
  {
   "id": "D3",
   "site": "E1",
   "type": "accident",
   "priorite": 1
  },
  {
   "id": "D4",
   "site": "Q5",
   "type": "incendie",
   "priorite": 1
  },
  {
   "id": "D5",
   "site": "H1",
   "type": "transfert",
   "priorite": 3
  }
 ],
 "scenarios": [
  {
   "id": "S0",
   "nom": "Situation normale",
   "reseau": "routes"
  },
  {
   "id": "S1",
   "nom": "Fermeture Q1 – H1",
   "reseau": "routes",
   "fermes": [
    [
     "Q1",
     "H1"
    ],
    [
     "H1",
     "Q1"
    ]
   ]
  },
  {
   "id": "S2",
   "nom": "Panne fibre H1 – E1",
   "reseau": "fibre",
   "panne": [
    "H1",
    "E1"
   ]
  },
  {
   "id": "S3",
   "nom": "Heure de pointe",
   "reseau": "routes"
  }
 ]
};

export const resultats = {"itineraires": {"S0": {"C1": {"C1": {"duree": 0, "chemin": ["C1"]}, "C2": {"duree": 22.0, "chemin": ["C1", "Q1", "H1", "E1", "T1", "C2"]}, "H1": {"duree": 10.0, "chemin": ["C1", "Q1", "H1"]}, "E1": {"duree": 15.0, "chemin": ["C1", "Q1", "H1", "E1"]}, "T1": {"duree": 18.0, "chemin": ["C1", "Q1", "H1", "E1", "T1"]}, "Q1": {"duree": 4.0, "chemin": ["C1", "Q1"]}, "Q2": {"duree": 6.0, "chemin": ["C1", "Q1", "Q2"]}, "Q3": {"duree": 9.0, "chemin": ["C1", "Q1", "Q2", "Q3"]}, "Q4": {"duree": 28.0, "chemin": ["C1", "Q1", "H1", "E1", "T1", "C2", "Q4"]}, "Q5": {"duree": null, "chemin": null}}, "C2": {"C1": {"duree": 22.0, "chemin": ["C2", "T1", "E1", "H1", "Q1", "C1"]}, "C2": {"duree": 0, "chemin": ["C2"]}, "H1": {"duree": 12.0, "chemin": ["C2", "T1", "E1", "H1"]}, "E1": {"duree": 7.0, "chemin": ["C2", "T1", "E1"]}, "T1": {"duree": 4.0, "chemin": ["C2", "T1"]}, "Q1": {"duree": 18.0, "chemin": ["C2", "T1", "E1", "H1", "Q1"]}, "Q2": {"duree": 20.0, "chemin": ["C2", "T1", "E1", "H1", "Q1", "Q2"]}, "Q3": {"duree": 23.0, "chemin": ["C2", "T1", "E1", "H1", "Q1", "Q2", "Q3"]}, "Q4": {"duree": 6.0, "chemin": ["C2", "Q4"]}, "Q5": {"duree": null, "chemin": null}}}, "S1": {"C1": {"C1": {"duree": 0, "chemin": ["C1"]}, "C2": {"duree": 23.0, "chemin": ["C1", "Q1", "Q2", "Q3", "H1", "E1", "T1", "C2"]}, "H1": {"duree": 11.0, "chemin": ["C1", "Q1", "Q2", "Q3", "H1"]}, "E1": {"duree": 16.0, "chemin": ["C1", "Q1", "Q2", "Q3", "H1", "E1"]}, "T1": {"duree": 19.0, "chemin": ["C1", "Q1", "Q2", "Q3", "H1", "E1", "T1"]}, "Q1": {"duree": 4.0, "chemin": ["C1", "Q1"]}, "Q2": {"duree": 6.0, "chemin": ["C1", "Q1", "Q2"]}, "Q3": {"duree": 9.0, "chemin": ["C1", "Q1", "Q2", "Q3"]}, "Q4": {"duree": 29.0, "chemin": ["C1", "Q1", "Q2", "Q3", "H1", "E1", "T1", "C2", "Q4"]}, "Q5": {"duree": null, "chemin": null}}, "C2": {"C1": {"duree": null, "chemin": null}, "C2": {"duree": 0, "chemin": ["C2"]}, "H1": {"duree": 12.0, "chemin": ["C2", "T1", "E1", "H1"]}, "E1": {"duree": 7.0, "chemin": ["C2", "T1", "E1"]}, "T1": {"duree": 4.0, "chemin": ["C2", "T1"]}, "Q1": {"duree": null, "chemin": null}, "Q2": {"duree": null, "chemin": null}, "Q3": {"duree": null, "chemin": null}, "Q4": {"duree": 6.0, "chemin": ["C2", "Q4"]}, "Q5": {"duree": null, "chemin": null}}}, "S3": {"C1": {"C1": {"duree": 0, "chemin": ["C1"]}, "C2": {"duree": 31.0, "chemin": ["C1", "Q1", "H1", "E1", "T1", "C2"]}, "H1": {"duree": 15.0, "chemin": ["C1", "Q1", "H1"]}, "E1": {"duree": 22.0, "chemin": ["C1", "Q1", "H1", "E1"]}, "T1": {"duree": 26.0, "chemin": ["C1", "Q1", "H1", "E1", "T1"]}, "Q1": {"duree": 6.0, "chemin": ["C1", "Q1"]}, "Q2": {"duree": 9.0, "chemin": ["C1", "Q1", "Q2"]}, "Q3": {"duree": 14.0, "chemin": ["C1", "Q1", "Q2", "Q3"]}, "Q4": {"duree": 39.0, "chemin": ["C1", "Q1", "H1", "E1", "T1", "C2", "Q4"]}, "Q5": {"duree": null, "chemin": null}}, "C2": {"C1": {"duree": 31.0, "chemin": ["C2", "T1", "E1", "H1", "Q1", "C1"]}, "C2": {"duree": 0, "chemin": ["C2"]}, "H1": {"duree": 16.0, "chemin": ["C2", "T1", "E1", "H1"]}, "E1": {"duree": 9.0, "chemin": ["C2", "T1", "E1"]}, "T1": {"duree": 5.0, "chemin": ["C2", "T1"]}, "Q1": {"duree": 25.0, "chemin": ["C2", "T1", "E1", "H1", "Q1"]}, "Q2": {"duree": 28.0, "chemin": ["C2", "T1", "E1", "H1", "Q1", "Q2"]}, "Q3": {"duree": 33.0, "chemin": ["C2", "T1", "E1", "H1", "Q1", "Q2", "Q3"]}, "Q4": {"duree": 8.0, "chemin": ["C2", "Q4"]}, "Q5": {"duree": null, "chemin": null}}}}, "accessibilite": {"S0": {"C1": {"C1": 0, "Q1": 1, "Q2": 1, "H1": 2, "Q3": 2, "E1": 3, "T1": 4, "C2": 5, "Q4": 6}, "C2": {"C2": 0, "T1": 1, "Q4": 1, "E1": 2, "H1": 3, "Q1": 4, "C1": 5, "Q2": 5, "Q3": 6}, "C1|C2": {"C1": 0, "C2": 0, "Q1": 1, "Q2": 1, "T1": 1, "Q4": 1, "H1": 2, "Q3": 2, "E1": 2}}, "S1": {"C1": {"C1": 0, "Q1": 1, "Q2": 1, "Q3": 2, "H1": 3, "E1": 3, "T1": 4, "C2": 5, "Q4": 6}, "C2": {"C2": 0, "T1": 1, "Q4": 1, "E1": 2, "H1": 3}, "C1|C2": {"C1": 0, "C2": 0, "Q1": 1, "Q2": 1, "T1": 1, "Q4": 1, "Q3": 2, "E1": 2, "H1": 3}}, "S3": {"C1": {"C1": 0, "Q1": 1, "Q2": 1, "H1": 2, "Q3": 2, "E1": 3, "T1": 4, "C2": 5, "Q4": 6}, "C2": {"C2": 0, "T1": 1, "Q4": 1, "E1": 2, "H1": 3, "Q1": 4, "C1": 5, "Q2": 5, "Q3": 6}, "C1|C2": {"C1": 0, "C2": 0, "Q1": 1, "Q2": 1, "T1": 1, "Q4": 1, "H1": 2, "Q3": 2, "E1": 2}}}, "scenarios": {"S1": [{"id": "D1", "site": "Q4", "type": "incendie", "priorite": 1, "caserne": "C2", "avant": 6.0, "apres": 6.0}, {"id": "D2", "site": "Q3", "type": "malaise", "priorite": 2, "caserne": "C1", "avant": 9.0, "apres": 9.0}, {"id": "D3", "site": "E1", "type": "accident", "priorite": 1, "caserne": "C2", "avant": 7.0, "apres": 7.0}, {"id": "D4", "site": "Q5", "type": "incendie", "priorite": 1, "caserne": null, "avant": null, "apres": null}, {"id": "D5", "site": "H1", "type": "transfert", "priorite": 3, "caserne": "C1", "avant": 10.0, "apres": 11.0}], "S3": [{"id": "D1", "site": "Q4", "type": "incendie", "priorite": 1, "caserne": "C2", "avant": 6.0, "apres": 8.0}, {"id": "D2", "site": "Q3", "type": "malaise", "priorite": 2, "caserne": "C1", "avant": 9.0, "apres": 14.0}, {"id": "D3", "site": "E1", "type": "accident", "priorite": 1, "caserne": "C2", "avant": 7.0, "apres": 9.0}, {"id": "D4", "site": "Q5", "type": "incendie", "priorite": 1, "caserne": null, "avant": null, "apres": null}, {"id": "D5", "site": "H1", "type": "transfert", "priorite": 3, "caserne": "C1", "avant": 10.0, "apres": 15.0}]}, "fibre": {"aretes": [["E1", "T1", 2.0], ["Q1", "Q2", 2.0], ["C1", "Q1", 3.0], ["Q2", "Q3", 3.0], ["T1", "C2", 3.0], ["Q1", "H1", 4.0], ["Q4", "Q5", 4.0], ["C2", "Q4", 5.0], ["H1", "E1", 6.0]], "cout_total": 32.0, "composantes": 1, "pannes": {"H1-E1": {"reparation": ["Q3", "E1", 7.0], "nouveau_cout": 33.0}}}};
