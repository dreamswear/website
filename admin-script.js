// admin-script.js - VERSION TEST AVEC LOGS DÉTAILLÉS
const SUPABASE_URL = 'https://kfptsbpriihydidnfzhj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHRzYnByaWloeWRpZG5memhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjgxODIsImV4cCI6MjA4MTY0NDE4Mn0.R4AS9kj-o3Zw0OeOTAojMeZfjPtkOZiW0jM367Fmrkk';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// TEST DE CONNEXION À SUPABASE
async function testSupabaseConnection() {
    console.log('🔍 Test de connexion Supabase...');
    
    try {
        // 1. Test simple : compter tous les créateurs
        const { count, error: countError } = await supabase
            .from('créateurs')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            console.error('❌ Erreur de compte:', countError);
            document.getElementById('pendingCreators').innerHTML = 
                `<div style="color: red; padding: 20px;">
                    <strong>Erreur de connexion à Supabase:</strong><br>
                    ${countError.message}<br><br>
                    <small>Vérifiez les politiques RLS dans votre dashboard Supabase</small>
                </div>`;
            return false;
        }
        
        console.log(`✅ Connection réussie! ${count} créateurs trouvés`);
        
        // 2. Récupérer TOUS les créateurs sans filtre
        const { data: allCreators, error: allError } = await supabase
            .from('créateurs')
            .select('*')
            .order('date_inscription', { ascending: false });
        
        if (allError) {
            console.error('❌ Erreur récupération complète:', allError);
            return false;
        }
        
        console.log('📊 Tous les créateurs:', allCreators);
        
        // Afficher pour debug
        const debugInfo = document.createElement('div');
        debugInfo.style.cssText = `
            background: #e9f7ef;
            border: 2px solid #28a745;
            padding: 15px;
            margin: 15px 0;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
        `;
        
        debugInfo.innerHTML = `
            <strong>DEBUG SUPABASE:</strong><br>
            Connection: ✅ SUCCESS<br>
            Total créateurs: ${count}<br>
            <hr>
            <strong>LISTE COMPLÈTE (${allCreators?.length || 0}):</strong><br>
            ${allCreators?.map(c => 
                `- ${c.nom_marque || 'Sans nom'} (ID: ${c.id}) → <strong style="color: ${c.statut === 'pending' ? '#dc3545' : '#28a745'}">${c.statut}</strong><br>`
            ).join('') || 'Aucun créateur trouvé'}
        `;
        
        document.querySelector('.admin-section').prepend(debugInfo);
        return true;
        
    } catch (error) {
        console.error('💥 Erreur inattendue:', error);
        return false;
    }
}

// MODIFIER VOTRE loadAllCreators() pour inclure le test
async function loadAllCreators() {
    console.log('🚀 Chargement des créateurs...');
    
    // D'abord tester la connexion
    const connected = await testSupabaseConnection();
    if (!connected) return;
    
    // Ensuite charger normalement...
    // [Votre code existant pour loadAllCreators]
}
