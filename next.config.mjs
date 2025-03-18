/** @type {import('next').NextConfig} */
const nextConfig = {
  // Activation du support pour styled-jsx
  compiler: {
    styledComponents: true,
  },
  
  // Configuration des variables d'environnement
  env: {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
  },
  
  // Configuration des images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Configuration des en-têtes HTTP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Configuration pour l'API
  api: {
    // Augmenter la taille maximale des requêtes (10Mo)
    bodyParser: {
      sizeLimit: '10mb',
    },
    // Désactiver la validation du type de contenu pour permettre les uploads
    externalResolver: true,
  },
  
  // Configuration pour le serveur de développement
  // Augmenter les timeouts pour les requêtes
  experimental: {
    serverComponentsExternalPackages: ['formidable'], // Externaliser formidable pour éviter les problèmes de compilation
    // timeout des requêtes prolongée
    requestTimeout: 60000, // 60 secondes
  },
};

export default nextConfig; 