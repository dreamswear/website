// 1. Configuration Supabase AVEC CLÉ DE SERVICE (ADMIN)
const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
// REMPLACEZ par votre clé "service_role" (secrète) depuis Dashboard > API
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA2ODE4MiwiZXhwIjoyMDgxNjQ0MTgyfQ.8AxNaPkV9EHJUBNClWRWKGCrhxEv_rZvFethzEPQrWg'; // <-- CRITIQUE

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false // Important pour les opérations admin
  }
});

// 2. Vérification de connexion admin (RENFORCÉE)
const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn');
const adminId = sessionStorage.getItem('adminId');
if (!isAdminLoggedIn || isAdminLoggedIn !== 'true' || !adminId) {
  alert('⚠️ Session administrateur invalide.');
  window.location.href = 'index.html';
  return;
}

// 3. Fonction approveCreator - AVEC GESTION D'ERREUR DÉTAILLÉE
async function approveCreator(id, brandName) {
  console.log(`🔄 Approbation de: ${id} - "${brandName}"`);
  
  if (!confirm(`Approuver "${brandName}" ?`)) return;
  
  try {
    // Log avant la requête
    console.log(`📤 Envoi UPDATE pour id: ${id}, statut: 'actif'`);
    
    // REQUÊTE UPDATE CORRIGÉE
    const { data, error } = await supabase
      .from('créateurs')
      .update({
        statut: 'actif',
        date_validation: new Date().toISOString(),
        administrateur_id: adminId // Optionnel : trace l'admin ayant validé
      })
      .eq('id', id)
      .select(); // .select() permet de voir ce qui a été modifié

    // ANALYSE DE LA RÉPONSE
    console.log('📥 Réponse UPDATE:', { data, error });
    
    if (error) {
      // AFFICHE L'ERREUR SQL COMPLÈTE
      console.error('❌ Erreur Supabase détaillée:', error);
      
      // Messages d'erreur spécifiques[citation:8]
      if (error.code === '42501') {
        alert(`❌ Permission refusée (RLS). Voir la console.`);
      } else if (error.message.includes('does not exist')) {
        alert(`❌ Erreur de colonne: ${error.message}`);
      } else {
        alert(`❌ Erreur: ${error.message}`);
      }
      return;
    }
    
    if (data && data.length > 0) {
      alert(`✅ "${brandName}" approuvé !`);
      console.log('✅ Données mises à jour:', data[0]);
      loadAllCreators(); // Recharge la liste
    } else {
      alert('⚠️ Aucune donnée modifiée (créateur peut-être déjà traité).');
    }
    
  } catch (error) {
    console.error('💥 Erreur inattendue:', error);
    alert('💥 Erreur de connexion ou de script.');
  }
}
