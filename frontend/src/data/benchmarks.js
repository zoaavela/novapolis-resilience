// Mesures de performance, recopiées depuis resultats/benchmarks/resultats.json.
// Produites par : python backend/cli.py benchmark --sortie resultats/benchmarks
// Fichier écrit automatiquement par la commande benchmark : ne pas le modifier à la main.

export const MESURES = {
  "graine": 1,
  "repetitions": 5,
  "taille": [
    {
      "algo": "BFS",
      "V": 100,
      "E": 688,
      "ms": 0.064,
      "ecart": 0.007
    },
    {
      "algo": "DFS",
      "V": 100,
      "E": 688,
      "ms": 0.095,
      "ecart": 0.015
    },
    {
      "algo": "Dijkstra",
      "V": 100,
      "E": 688,
      "ms": 0.299,
      "ecart": 0.08
    },
    {
      "algo": "Bellman-Ford",
      "V": 100,
      "E": 688,
      "ms": 0.39,
      "ecart": 0.049
    },
    {
      "algo": "Kruskal",
      "V": 100,
      "E": 688,
      "ms": 0.553,
      "ecart": 0.041
    },
    {
      "algo": "Prim",
      "V": 100,
      "E": 688,
      "ms": 0.301,
      "ecart": 0.028
    },
    {
      "algo": "BFS",
      "V": 250,
      "E": 1706,
      "ms": 0.182,
      "ecart": 0.008
    },
    {
      "algo": "DFS",
      "V": 250,
      "E": 1706,
      "ms": 0.241,
      "ecart": 0.019
    },
    {
      "algo": "Dijkstra",
      "V": 250,
      "E": 1706,
      "ms": 0.688,
      "ecart": 0.078
    },
    {
      "algo": "Bellman-Ford",
      "V": 250,
      "E": 1706,
      "ms": 1.057,
      "ecart": 0.019
    },
    {
      "algo": "Kruskal",
      "V": 250,
      "E": 1706,
      "ms": 1.415,
      "ecart": 0.124
    },
    {
      "algo": "Prim",
      "V": 250,
      "E": 1706,
      "ms": 0.846,
      "ecart": 0.109
    },
    {
      "algo": "BFS",
      "V": 500,
      "E": 3410,
      "ms": 0.443,
      "ecart": 0.09
    },
    {
      "algo": "DFS",
      "V": 500,
      "E": 3410,
      "ms": 0.545,
      "ecart": 0.037
    },
    {
      "algo": "Dijkstra",
      "V": 500,
      "E": 3410,
      "ms": 1.391,
      "ecart": 0.071
    },
    {
      "algo": "Bellman-Ford",
      "V": 500,
      "E": 3410,
      "ms": 2.652,
      "ecart": 0.076
    },
    {
      "algo": "Kruskal",
      "V": 500,
      "E": 3410,
      "ms": 2.739,
      "ecart": 0.14
    },
    {
      "algo": "Prim",
      "V": 500,
      "E": 3410,
      "ms": 1.796,
      "ecart": 0.045
    },
    {
      "algo": "BFS",
      "V": 1000,
      "E": 6882,
      "ms": 0.794,
      "ecart": 0.046
    },
    {
      "algo": "DFS",
      "V": 1000,
      "E": 6882,
      "ms": 1.056,
      "ecart": 0.098
    },
    {
      "algo": "Dijkstra",
      "V": 1000,
      "E": 6882,
      "ms": 2.902,
      "ecart": 0.173
    },
    {
      "algo": "Bellman-Ford",
      "V": 1000,
      "E": 6882,
      "ms": 6.018,
      "ecart": 0.452
    },
    {
      "algo": "Kruskal",
      "V": 1000,
      "E": 6882,
      "ms": 6.46,
      "ecart": 0.302
    },
    {
      "algo": "Prim",
      "V": 1000,
      "E": 6882,
      "ms": 3.444,
      "ecart": 0.057
    },
    {
      "algo": "BFS",
      "V": 2000,
      "E": 13740,
      "ms": 2.044,
      "ecart": 0.219
    },
    {
      "algo": "DFS",
      "V": 2000,
      "E": 13740,
      "ms": 2.307,
      "ecart": 0.022
    },
    {
      "algo": "Dijkstra",
      "V": 2000,
      "E": 13740,
      "ms": 9.742,
      "ecart": 2.162
    },
    {
      "algo": "Bellman-Ford",
      "V": 2000,
      "E": 13740,
      "ms": 19.791,
      "ecart": 4.512
    },
    {
      "algo": "Kruskal",
      "V": 2000,
      "E": 13740,
      "ms": 23.508,
      "ecart": 3.486
    },
    {
      "algo": "Prim",
      "V": 2000,
      "E": 13740,
      "ms": 13.615,
      "ecart": 0.715
    },
    {
      "algo": "BFS",
      "V": 4000,
      "E": 27474,
      "ms": 3.837,
      "ecart": 0.21
    },
    {
      "algo": "DFS",
      "V": 4000,
      "E": 27474,
      "ms": 4.369,
      "ecart": 0.053
    },
    {
      "algo": "Dijkstra",
      "V": 4000,
      "E": 27474,
      "ms": 13.787,
      "ecart": 0.294
    },
    {
      "algo": "Bellman-Ford",
      "V": 4000,
      "E": 27474,
      "ms": 35.821,
      "ecart": 2.71
    },
    {
      "algo": "Kruskal",
      "V": 4000,
      "E": 27474,
      "ms": 35.735,
      "ecart": 2.552
    },
    {
      "algo": "Prim",
      "V": 4000,
      "E": 27474,
      "ms": 22.002,
      "ecart": 2.068
    }
  ],
  "densite": [
    {
      "algo": "BFS",
      "V": 1000,
      "E": 4576,
      "ms": 0.602,
      "ecart": 0.03,
      "degre": 2
    },
    {
      "algo": "DFS",
      "V": 1000,
      "E": 4576,
      "ms": 0.775,
      "ecart": 0.102,
      "degre": 2
    },
    {
      "algo": "Dijkstra",
      "V": 1000,
      "E": 4576,
      "ms": 2.272,
      "ecart": 0.106,
      "degre": 2
    },
    {
      "algo": "Bellman-Ford",
      "V": 1000,
      "E": 4576,
      "ms": 4.066,
      "ecart": 0.131,
      "degre": 2
    },
    {
      "algo": "Kruskal",
      "V": 1000,
      "E": 4576,
      "ms": 5.34,
      "ecart": 0.302,
      "degre": 2
    },
    {
      "algo": "Prim",
      "V": 1000,
      "E": 4576,
      "ms": 2.737,
      "ecart": 0.026,
      "degre": 2
    },
    {
      "algo": "BFS",
      "V": 1000,
      "E": 6882,
      "ms": 0.922,
      "ecart": 0.05,
      "degre": 4
    },
    {
      "algo": "DFS",
      "V": 1000,
      "E": 6882,
      "ms": 1.156,
      "ecart": 0.078,
      "degre": 4
    },
    {
      "algo": "Dijkstra",
      "V": 1000,
      "E": 6882,
      "ms": 3.438,
      "ecart": 0.264,
      "degre": 4
    },
    {
      "algo": "Bellman-Ford",
      "V": 1000,
      "E": 6882,
      "ms": 6.667,
      "ecart": 0.624,
      "degre": 4
    },
    {
      "algo": "Kruskal",
      "V": 1000,
      "E": 6882,
      "ms": 6.771,
      "ecart": 0.253,
      "degre": 4
    },
    {
      "algo": "Prim",
      "V": 1000,
      "E": 6882,
      "ms": 5.118,
      "ecart": 0.624,
      "degre": 4
    },
    {
      "algo": "BFS",
      "V": 1000,
      "E": 11268,
      "ms": 1.213,
      "ecart": 0.043,
      "degre": 8
    },
    {
      "algo": "DFS",
      "V": 1000,
      "E": 11268,
      "ms": 1.99,
      "ecart": 0.354,
      "degre": 8
    },
    {
      "algo": "Dijkstra",
      "V": 1000,
      "E": 11268,
      "ms": 4.586,
      "ecart": 0.512,
      "degre": 8
    },
    {
      "algo": "Bellman-Ford",
      "V": 1000,
      "E": 11268,
      "ms": 13.791,
      "ecart": 1.453,
      "degre": 8
    },
    {
      "algo": "Kruskal",
      "V": 1000,
      "E": 11268,
      "ms": 12.782,
      "ecart": 2.077,
      "degre": 8
    },
    {
      "algo": "Prim",
      "V": 1000,
      "E": 11268,
      "ms": 9.659,
      "ecart": 0.326,
      "degre": 8
    },
    {
      "algo": "BFS",
      "V": 1000,
      "E": 19940,
      "ms": 1.732,
      "ecart": 0.058,
      "degre": 16
    },
    {
      "algo": "DFS",
      "V": 1000,
      "E": 19940,
      "ms": 2.398,
      "ecart": 0.134,
      "degre": 16
    },
    {
      "algo": "Dijkstra",
      "V": 1000,
      "E": 19940,
      "ms": 5.72,
      "ecart": 0.118,
      "degre": 16
    },
    {
      "algo": "Bellman-Ford",
      "V": 1000,
      "E": 19940,
      "ms": 16.785,
      "ecart": 2.573,
      "degre": 16
    },
    {
      "algo": "Kruskal",
      "V": 1000,
      "E": 19940,
      "ms": 18.916,
      "ecart": 4.096,
      "degre": 16
    },
    {
      "algo": "Prim",
      "V": 1000,
      "E": 19940,
      "ms": 10.194,
      "ecart": 1.481,
      "degre": 16
    }
  ],
  "floyd": [
    {
      "algo": "Floyd-Warshall",
      "V": 25,
      "E": 166,
      "ms": 0.795,
      "ecart": 0.008
    },
    {
      "algo": "Dijkstra (1 source)",
      "V": 25,
      "E": 166,
      "ms": 0.052,
      "ecart": 0.004
    },
    {
      "algo": "Floyd-Warshall",
      "V": 50,
      "E": 348,
      "ms": 4.955,
      "ecart": 0.25
    },
    {
      "algo": "Dijkstra (1 source)",
      "V": 50,
      "E": 348,
      "ms": 0.128,
      "ecart": 0.012
    },
    {
      "algo": "Floyd-Warshall",
      "V": 100,
      "E": 688,
      "ms": 35.196,
      "ecart": 2.698
    },
    {
      "algo": "Dijkstra (1 source)",
      "V": 100,
      "E": 688,
      "ms": 0.224,
      "ecart": 0.019
    },
    {
      "algo": "Floyd-Warshall",
      "V": 150,
      "E": 1016,
      "ms": 110.898,
      "ecart": 11.957
    },
    {
      "algo": "Dijkstra (1 source)",
      "V": 150,
      "E": 1016,
      "ms": 0.359,
      "ecart": 0.059
    },
    {
      "algo": "Floyd-Warshall",
      "V": 200,
      "E": 1362,
      "ms": 257.821,
      "ecart": 11.981
    },
    {
      "algo": "Dijkstra (1 source)",
      "V": 200,
      "E": 1362,
      "ms": 0.595,
      "ecart": 0.063
    },
    {
      "algo": "Floyd-Warshall",
      "V": 300,
      "E": 2036,
      "ms": 1134.97,
      "ecart": 91.55
    },
    {
      "algo": "Dijkstra (1 source)",
      "V": 300,
      "E": 2036,
      "ms": 1.329,
      "ecart": 0.039
    }
  ]
};
