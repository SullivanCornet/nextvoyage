import { NextResponse } from 'next/server';
import { insert, executeQuery, update } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Désactiver le body parser pour les uploads multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Fonction pour assurer que les répertoires d'upload existent
function ensureUploadDirectories() {
  const publicDir = path.join(process.cwd(), 'public');
  const uploadsDir = path.join(publicDir, 'uploads');
  const placesDir = path.join(uploadsDir, 'places');
  
  try {
    // Créer les répertoires s'ils n'existent pas
    if (!fs.existsSync(publicDir)) {
      console.log('Création du répertoire public');
      fs.mkdirSync(publicDir);
    }
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('Création du répertoire uploads');
      fs.mkdirSync(uploadsDir);
    }
    
    if (!fs.existsSync(placesDir)) {
      console.log('Création du répertoire places');
      fs.mkdirSync(placesDir);
    }
    
    // Tester l'écriture dans le répertoire
    const testFile = path.join(placesDir, 'test-access.txt');
    fs.writeFileSync(testFile, 'Test write access');
    fs.unlinkSync(testFile);
    
    return { success: true, directories: { publicDir, uploadsDir, placesDir } };
  } catch (error) {
    console.error('Erreur lors de la création des répertoires:', error);
    return { success: false, error: error.message };
  }
}

async function readFormData(request) {
  try {
    const formData = await request.formData();
    return { success: true, formData };
  } catch (error) {
    console.error('Erreur lors de la lecture du formData:', error);
    return { success: false, error: error.message };
  }
}

// Fonction pour analyser le formulaire multipart
async function parseForm(request) {
  try {
    console.log('API: Début du parsing du formulaire multipart');
    
    // Récupérer les répertoires d'upload
    const dirResult = ensureUploadDirectories();
    if (!dirResult.success) {
      throw new Error(`Problème avec les répertoires d'upload: ${dirResult.error}`);
    }
    
    // Lire les données du formulaire
    const formData = await request.formData();
    console.log('API: FormData reçu avec les champs:', Array.from(formData.keys()));
    
    // Convertir FormData en objet structuré
    const fields = {};
    const files = {};
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files[key] = value;
        console.log(`API: Fichier reçu pour le champ '${key}': ${value.name}, ${value.size} octets`);
      } else {
        // Pour les champs textuels, les organiser en tableaux (comme le fait formidable)
        if (!fields[key]) {
          fields[key] = [];
        }
        fields[key].push(value);
        
        // Ne pas afficher les valeurs potentiellement sensibles dans les logs
        console.log(`API: Champ '${key}' reçu`);
      }
    }
    
    return { fields, files };
  } catch (error) {
    console.error('API: Erreur lors du parsing du formulaire multipart:', error);
    throw error;
  }
}

// Fonction pour valider le type de fichier
function validateFileType(file) {
  if (!file || !(file instanceof File)) {
    return false;
  }
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.type);
}

// Fonction pour déplacer un fichier uploadé
async function moveUploadedFile(file, prefix, id) {
  try {
    if (!file || !(file instanceof File)) {
      throw new Error('Fichier invalide');
    }
    
    console.log(`API: Traitement du fichier ${file.name} (${file.size} octets)`);
    
    // Vérifier que les répertoires existent
    const dirResult = ensureUploadDirectories();
    if (!dirResult.success) {
      throw new Error(`Problème avec les répertoires d'upload: ${dirResult.error}`);
    }
    
    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const uniqueId = randomUUID();
    const timestamp = Date.now();
    const newFilename = `${prefix}_${id}_${timestamp}_${uniqueId.slice(0, 8)}.${fileExtension}`;
    
    const placesDir = path.join(process.cwd(), 'public', 'uploads', 'places');
    const imagePath = path.join(placesDir, newFilename);
    console.log(`API: Chemin complet du fichier: ${imagePath}`);
    
    try {
      // Convertir le fichier en buffer (opération asynchrone)
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Vérifier que le répertoire de destination existe
      if (!fs.existsSync(placesDir)) {
        console.log(`API: Création du répertoire manquant: ${placesDir}`);
        fs.mkdirSync(placesDir, { recursive: true });
      }
      
      // Écrire le fichier
      fs.writeFileSync(imagePath, buffer);
      console.log(`API: Fichier écrit avec succès: ${newFilename}`);
      
      // Vérifier que le fichier a bien été écrit
      if (!fs.existsSync(imagePath)) {
        throw new Error('Le fichier n\'a pas été correctement écrit sur le disque');
      }
      
      // Retourner le chemin relatif pour l'URL
      return `/uploads/places/${newFilename}`;
    } catch (fileError) {
      console.error(`API: Erreur lors de l'écriture du fichier:`, fileError);
      throw new Error(`Erreur lors de l'écriture du fichier: ${fileError.message}`);
    }
  } catch (error) {
    console.error('API: Erreur lors du déplacement du fichier:', error);
    throw error;
  }
}

export async function POST(request) {
  console.log('📥 Requête reçue sur /api/places/upload');
  
  try {
    // 1. S'assurer que les répertoires existent
    const dirResult = ensureUploadDirectories();
    if (!dirResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: `Problème avec les répertoires d'upload: ${dirResult.error}` 
      }, { status: 500 });
    }
    
    // 2. Lire les données du formulaire
    const formDataResult = await readFormData(request);
    if (!formDataResult.success) {
      return NextResponse.json({ 
        success: false, 
        error: `Problème avec les données du formulaire: ${formDataResult.error}` 
      }, { status: 400 });
    }
    
    const formData = formDataResult.formData;
    console.log('📋 FormData reçu avec les champs:', Array.from(formData.keys()));
    
    // 3. Récupérer les champs du formulaire
    const name = formData.get('name');
    const slug = formData.get('slug');
    const city_id = formData.get('city_id');
    const category_id = formData.get('category_id');
    const description = formData.get('description');
    const location = formData.get('location');
    const imageFile = formData.get('image');
    
    console.log('📝 Champs extraits du formulaire:', { 
      name, 
      slug, 
      city_id, 
      category_id, 
      description_length: description?.length,
      location,
      has_location_field: formData.has('location'),
      imageFile_name: imageFile?.name
    });
    
    // 4. Valider les champs obligatoires
    if (!name || !slug || !city_id || !category_id) {
      console.error('❌ Champs obligatoires manquants');
      return NextResponse.json({
        success: false,
        error: 'Champs obligatoires manquants (name, slug, city_id, category_id)',
        received: { name, slug, city_id, category_id }
      }, { status: 400 });
    }
    
    // 5. Vérifier si la ville existe
    const cityResult = await executeQuery('SELECT id FROM cities WHERE id = ?', [city_id]);
    if (!cityResult.length) {
      console.error(`❌ Ville non trouvée: ${city_id}`);
      return NextResponse.json({
        success: false,
        error: `La ville avec l'ID ${city_id} n'existe pas`
      }, { status: 400 });
    }
    
    // 6. Vérifier si la catégorie existe
    const categoryResult = await executeQuery('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (!categoryResult.length) {
      console.error(`❌ Catégorie non trouvée: ${category_id}`);
      return NextResponse.json({
        success: false,
        error: `La catégorie avec l'ID ${category_id} n'existe pas`
      }, { status: 400 });
    }
    
    // 7. Vérifier que le slug est unique pour cette ville
    const slugCheckResult = await executeQuery(
      'SELECT id FROM places WHERE slug = ? AND city_id = ?', 
      [slug, city_id]
    );
    
    if (slugCheckResult.length > 0) {
      console.error(`❌ Un lieu avec le slug "${slug}" existe déjà pour cette ville`);
      return NextResponse.json({
        success: false,
        error: `Un lieu avec le slug "${slug}" existe déjà pour cette ville`
      }, { status: 400 });
    }
    
    // 8. Traiter l'image si présente
    let image_path = null;
    
    if (imageFile && imageFile instanceof File) {
      console.log('🖼️ Traitement de l\'image:', imageFile.name, imageFile.type, `${Math.round(imageFile.size / 1024)} KB`);
      
      // Générer un nom de fichier unique
      const fileExtension = imageFile.name.split('.').pop().toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      if (!allowedExtensions.includes(fileExtension)) {
        console.error(`❌ Type de fichier non autorisé: ${fileExtension}`);
        return NextResponse.json({
          success: false,
          error: `Type de fichier non autorisé. Extensions acceptées: ${allowedExtensions.join(', ')}`
        }, { status: 400 });
      }
      
      // Créer un nom de fichier unique
      const uniqueId = randomUUID();
      const timestamp = Date.now();
      const newFilename = `img_${timestamp}_${uniqueId.slice(0, 8)}.${fileExtension}`;
      const imagePath = path.join(process.cwd(), 'public', 'uploads', 'places', newFilename);
      
      // Convertir le fichier en buffer
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      
      // Écrire le fichier
      fs.writeFileSync(imagePath, buffer);
      console.log(`✅ Image sauvegardée: ${imagePath}`);
      
      // Définir le chemin relatif pour la base de données
      image_path = `/uploads/places/${newFilename}`;
    } else {
      console.log('⚠️ Aucune image fournie ou format invalide');
    }
    
    // 9. Préparer les données pour l'insertion
    const placeData = {
      name,
      slug,
      city_id,
      category_id,
      description: description || null,
      location: location || null,
      image_path: image_path,
      status: 'published',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    
    console.log('📊 Données à insérer dans la table places:', placeData);
    
    // 10. Insérer le lieu dans la base de données
    try {
      const result = await insert('places', placeData);
      console.log('✨ Lieu ajouté avec succès, ID:', result.lastID);
      
      return NextResponse.json({
        success: true,
        message: 'Lieu ajouté avec succès',
        place: {
          id: result.lastID,
          ...placeData
        }
      });
    } catch (dbError) {
      console.error('❌ Erreur lors de l\'insertion dans la base de données:', dbError);
      
      // Si une image a été sauvegardée, la supprimer en cas d'échec
      if (image_path) {
        try {
          const fullPath = path.join(process.cwd(), 'public', image_path);
          fs.unlinkSync(fullPath);
          console.log(`🗑️ Image supprimée suite à l'échec de l'insertion: ${fullPath}`);
        } catch (cleanupError) {
          console.error('⚠️ Erreur lors de la suppression de l\'image:', cleanupError);
        }
      }
      
      return NextResponse.json({
        success: false,
        error: `Erreur lors de l'insertion dans la base de données: ${dbError.message}`
      }, { status: 500 });
    }
  } catch (error) {
    console.error('💥 Erreur générale lors du traitement de la requête:', error);
    return NextResponse.json({
      success: false,
      error: `Erreur lors du traitement de la requête: ${error.message}`
    }, { status: 500 });
  }
}

// PUT /api/places/upload - Endpoint pour mettre à jour un lieu avec une image
export async function PUT(request) {
  try {
    console.log('API: Réception d\'une requête de mise à jour avec image pour un lieu');
    
    // Analyser le formulaire multipart
    const { fields, files } = await parseForm(request);
    console.log('API: Formulaire parsé avec champs:', Object.keys(fields));
    
    // Extraire les champs du formulaire
    const id = fields.id?.[0];
    const name = fields.name?.[0] || '';
    const slug = fields.slug?.[0] || '';
    const description = fields.description?.[0] || '';
    const location = fields.location?.[0] || '';
    
    // Conserver les informations de catégorie et ville
    const category_id = fields.category_id?.[0];
    const city_id = fields.city_id?.[0];
    
    // Vérifier que l'ID est présent
    if (!id) {
      console.error('API: ID manquant dans la requête PUT');
      return NextResponse.json(
        { error: 'L\'identifiant du lieu est requis' },
        { status: 400 }
      );
    }
    
    // Vérifier que le lieu existe
    const placeQuery = 'SELECT * FROM places WHERE id = ?';
    console.log(`API: Recherche du lieu avec l'ID: ${id}`);
    const places = await executeQuery(placeQuery, [id]);
    
    if (places.length === 0) {
      console.error(`API: Lieu avec ID ${id} non trouvé dans la base de données`);
      return NextResponse.json(
        { error: 'Le lieu spécifié n\'existe pas' },
        { status: 404 }
      );
    }
    
    const existingPlace = places[0];
    console.log(`API: Lieu trouvé: ${existingPlace.name} (ID: ${existingPlace.id})`);
    
    // Vérifier et traiter l'image
    const imageFile = files.image;
    let imagePath = existingPlace.image_path;
    
    if (imageFile) {
      console.log(`API: Traitement de l'image: ${imageFile.name}, taille: ${imageFile.size} octets`);
      
      // Valider le type de fichier
      if (!validateFileType(imageFile)) {
        console.error(`API: Type de fichier non autorisé: ${imageFile.type}`);
        return NextResponse.json(
          { error: 'Type de fichier non autorisé. Utilisez JPG, JPEG, PNG ou GIF.' },
          { status: 400 }
        );
      }
      
      // Déplacer la nouvelle image
      try {
        imagePath = await moveUploadedFile(imageFile, 'place', id);
        console.log('API: Nouvelle image déplacée vers:', imagePath);
      } catch (uploadError) {
        console.error('API: Erreur lors du déplacement de l\'image:', uploadError);
        return NextResponse.json(
          { error: `Erreur lors du traitement de l'image: ${uploadError.message}` },
          { status: 500 }
        );
      }
    } else {
      console.log('API: Aucune nouvelle image fournie, conservation de l\'image existante');
    }
    
    // Préparer les données pour la mise à jour
    const placeData = {
      name: name || existingPlace.name,
      slug: slug || existingPlace.slug,
      description: description !== undefined ? description : existingPlace.description,
      location: location || existingPlace.location,
      image_path: imagePath
    };
    
    // Conserver les champs category_id et city_id s'ils sont présents dans les données existantes
    if (category_id) {
      placeData.category_id = category_id;
    } else if (existingPlace.category_id) {
      placeData.category_id = existingPlace.category_id;
    }
    
    if (city_id) {
      placeData.city_id = city_id;
    } else if (existingPlace.city_id) {
      placeData.city_id = existingPlace.city_id;
    }
    
    // Ajouter la date de mise à jour
    placeData.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    console.log('API: Données préparées pour mise à jour du lieu:', placeData);
    
    // Mettre à jour le lieu dans la base de données
    try {
      console.log(`API: Tentative de mise à jour du lieu ID ${id} dans la table 'places'`);
      const updatedPlace = await update('places', id, placeData);
      console.log('API: Lieu mis à jour avec succès, ID:', id);
      
      return NextResponse.json(updatedPlace);
    } catch (updateError) {
      console.error('API: Erreur spécifique de mise à jour de lieu:', updateError);
      return NextResponse.json(
        { error: `Erreur lors de la mise à jour du lieu: ${updateError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API: Erreur lors de la mise à jour du lieu avec image:', error);
    return NextResponse.json(
      { error: `Erreur lors de la mise à jour du lieu: ${error.message}` },
      { status: 500 }
    );
  }
} 