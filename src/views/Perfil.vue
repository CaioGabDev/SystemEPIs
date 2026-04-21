<template>
    <div class="perfil-page">
        <HeaderAluno v-if="isAluno" />
        <HeaderGeral v-else />
        <main class="perfil-main">
            <SidebarAluno v-if="isAluno" />
            <section class="content">
                <div class="content-header">
                    <h1>{{ isAluno ? 'Perfil do Aluno' : 'Perfil do Funcionário' }}</h1>
                    <p>Gerencie suas informações pessoais</p>
                </div>
                <div class="profile-card">
                    <div class="profile-card-header">
                        <div class="avatar-section">
                            <div class="avatar">
                                <img v-if="user?.foto" :src="user.foto" alt="Foto do perfil">
                                <i v-else class="fas fa-user"></i>
                            </div>
                            <button @click="changePhoto" class="change-photo-btn">Alterar Foto</button>
                            <input ref="photoInput" type="file" @change="handlePhotoChange" accept="image/*" style="display: none;">
                        </div>
                        <div class="profile-info">
                            <h1>{{ profileName }}</h1>
                            <p class="turma-label">Turma: {{ turmaNome || "Sem turma" }}</p>
                        </div>
                        <div class="profile-actions">
                            <div v-if="!editMode" class="action-buttons-group">
                                <button class="edit-btn" @click="editProfile">
                                    Editar Perfil
                                </button>
                                <button class="logout-btn" @click="handleLogout" title="Deslogar da conta">
                                    Sair da Conta
                                </button>
                            </div>
                            <div v-else class="edit-actions">
                                <button class="save-btn" @click="saveProfile">Salvar</button>
                                <button class="cancel-btn" @click="cancelEdit">Cancelar</button>
                            </div>
                        </div>
                    </div>

                    <div class="profile-grid">
                        <div class="info-box">
                            <h2>Informações Pessoais</h2>
                            <div class="info-row">
                                <span>Nome</span>
                                <div class="info-value">
                                    <input v-if="editMode" v-model="profileData.nome" type="text" class="info-input" />
                                    <strong v-else>{{ user?.nome || "---" }}</strong>
                                </div>
                            </div>
                            <div class="info-row">
                                <span>Sobrenome</span>
                                <div class="info-value">
                                    <input v-if="editMode" v-model="profileData.sobrenome" type="text"
                                        class="info-input" />
                                    <strong v-else>{{ user?.sobrenome || "---" }}</strong>
                                </div>
                            </div>
                            <div class="info-row">
                                <span>Data de Nascimento</span>
                                <div class="info-value">
                                    <input v-if="editMode" v-model="profileData.data_nascimento" type="date"
                                        class="info-input" />
                                    <strong v-else>{{
                                        formatDate(user?.data_nascimento)
                                        }}</strong>
                                </div>
                            </div>
                            <div v-if="isAluno" class="info-row">
                                <span>Turma</span>
                                <div class="info-value">
                                    <strong>{{ turmaNome || "---" }}</strong>
                                </div>
                            </div>
                        </div>

                        <div class="info-box">
                            <h2>Dados de Contato</h2>
                            <div class="info-row">
                                <span>E-mail</span>
                                <div class="info-value">
                                    <strong>{{ user?.email || "---" }}</strong>
                                </div>
                            </div>
                            <div class="info-row">
                                <span>Telefone</span>
                                <div class="info-value">
                                    <input v-if="editMode" v-model="profileData.telefone" type="tel"
                                        class="info-input" />
                                    <strong v-else>{{ user?.telefone || "---" }}</strong>
                                </div>
                            </div>
                            <div class="info-row">
                                <span>CPF</span>
                                <div class="info-value">
                                    <input v-if="editMode" v-model="profileData.cpf" type="text" class="info-input" />
                                    <strong v-else>{{ user?.cpf || "---" }}</strong>
                                </div>
                            </div>
                        </div>

                        <div class="info-box">
                            <h2>Segurança e Acesso</h2>
                            <div class="info-row">
                                <span>Função</span><strong>{{ isAluno ? 'Aluno' : 'Funcionário' }}</strong>
                            </div>
                            <div class="password-section">
                                <button @click="showPasswordModal = true" class="change-password-btn">
                                    Alterar Senha
                                </button>
                            </div>
                            <div class="info-row">
                                <span>Status</span><strong>Ativo</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal para alterar senha -->
                <div v-if="showPasswordModal" class="modal-overlay" @click="showPasswordModal = false">
                    <div class="modal-content" @click.stop>
                        <h3>Alterar Senha</h3>
                        <form @submit.prevent="changePassword">
                            <div class="form-group">
                                <label>Senha Atual</label>
                                <input v-model="passwordData.current" type="password" required>
                            </div>
                            <div class="form-group">
                                <label>Nova Senha</label>
                                <input v-model="passwordData.new" type="password" required>
                            </div>
                            <div class="form-group">
                                <label>Confirmar Nova Senha</label>
                                <input v-model="passwordData.confirm" type="password" required>
                            </div>
                            <div class="modal-actions">
                                <button type="button" @click="showPasswordModal = false" class="cancel-btn">Cancelar</button>
                                <button type="submit" class="save-btn">Alterar Senha</button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import HeaderAluno from "../components/HeaderAluno.vue";
import HeaderGeral from "../components/HeaderGeral.vue";
import SidebarAluno from "../components/SidebarAluno.vue";
import { ref, computed, onMounted, watch } from "vue";
// ==========================================
// IMPORTAÇÕES E COMPOSABLES
// ==========================================
// Importa o composable de Supabase que contém todas as funções de autenticação
import { useSupabase } from "../composables/useSupabase";
// Importa o router do Vue para navegação entre páginas
import { useRouter } from "vue-router";

// ==========================================
// INICIALIZAÇÃO DAS FUNÇÕES
// ==========================================
// Desestrutura as funções e estado do Supabase
const { session, supabase, signOut } = useSupabase();
const router = useRouter();

// ==========================================
// DADOS REATIVOS DO PERFIL
// ==========================================
// Armazena os dados do usuário logado
const user = ref(null);
// Flag para indicar se é aluno ou funcionário
const isAluno = ref(false);
// Armazena o nome da turma do aluno
const turmaNome = ref("");
// Armazena EPIs já entregues ao usuário
const episAssigned = ref([]);
// Armazena todos os EPIs disponíveis
const episAvailable = ref([]);
// Campo para filtrar EPIs
const filterQuery = ref("");
// Flag para controlar carregamento de dados
const loading = ref(true);
// Flag para controlar modo de edição
const editMode = ref(false);
// Armazena dados do perfil para edição
const profileData = ref({
    nome: "",
    sobrenome: "",
    email: "",
    telefone: "",
    cpf: "",
    data_nascimento: "",
});
// Modal para alterar senha
const showPasswordModal = ref(false);
const passwordData = ref({
    current: '',
    new: '',
    confirm: ''
});
// Ref para input de foto
const photoInput = ref(null);

// ==========================================
// COMPUTED PROPERTIES - DADOS COMPUTADOS
// ==========================================
// Calcula o nome completo do usuário dinamicamente
const profileName = computed(() => {
    if (!user.value) return "Carregando...";
    return `${user.value.nome || ""} ${user.value.sobrenome || ""}`.trim();
});

// Formata data para o padrão brasileiro (dd/mm/yyyy)
const formatDate = (value) => {
    if (!value) return "--";
    return new Date(value).toLocaleDateString("pt-BR");
};

// Filtra EPIs disponíveis baseado no campo de busca
const filteredEpis = computed(() => {
    const query = filterQuery.value.toLowerCase().trim();
    if (!query) return episAvailable.value;
    return episAvailable.value.filter((epi) =>
        epi.nome.toLowerCase().includes(query),
    );
});

// ==========================================
// FUNÇÕES DE MANIPULAÇÃO DO FORMULÁRIO
// ==========================================
// Preenche o formulário com os dados atuais do usuário
const setProfileForm = () => {
    if (!user.value) return;
    profileData.value = {
        nome: user.value.nome || "",
        sobrenome: user.value.sobrenome || "",
        email: user.value.email || "",
        telefone: user.value.telefone || "",
        cpf: user.value.cpf || "",
        data_nascimento: user.value.data_nascimento || "",
    };
};

// Ativa o modo de edição
const editProfile = () => {
    editMode.value = true;
    setProfileForm();
};

// Cancela a edição e revert dados originais
const cancelEdit = () => {
    editMode.value = false;
    setProfileForm();
};

// ==========================================
// FUNÇÃO DE ATUALIZAR PERFIL
// ==========================================
// Salva as alterações do perfil no banco de dados
const saveProfile = async () => {
    if (!user.value) return;

    try {
        // Prepara os dados para atualizar
        const updateData = {
            nome: profileData.value.nome,
            sobrenome: profileData.value.sobrenome,
            telefone: profileData.value.telefone,
            cpf: profileData.value.cpf,
            data_nascimento: profileData.value.data_nascimento,
        };

        // Determina se é aluno ou funcionário baseado na ID
        const isAluno = user.value.idaluno !== undefined;
        const tableName = isAluno ? "aluno" : "funcionario";
        const idField = isAluno ? "idaluno" : "idfuncionario";
        const idValue = isAluno ? user.value.idaluno : user.value.idfuncionario;

        // Executa a atualização no banco
        const { data: updated, error } = await supabase
            .from(tableName)
            .update(updateData)
            .eq(idField, idValue)
            .select()
            .single();

        if (error) throw error;

        // Atualiza o objeto user com os novos dados
        user.value = { ...user.value, ...updated };
        editMode.value = false;
        setProfileForm();
        alert('Perfil atualizado com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        alert('Não foi possível atualizar o perfil.');
    }
};

// ==========================================
// FUNÇÕES PARA ALTERAR SENHA E FOTO
// ==========================================
const changePassword = async () => {
    if (passwordData.value.new !== passwordData.value.confirm) {
        alert('As senhas não coincidem!');
        return;
    }

    try {
        const { error } = await supabase.auth.updateUser({
            password: passwordData.value.new
        });

        if (error) throw error;

        alert('Senha alterada com sucesso!');
        showPasswordModal.value = false;
        passwordData.value = { current: '', new: '', confirm: '' };
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        alert('Erro ao alterar senha: ' + error.message);
    }
};

const changePhoto = () => {
    photoInput.value?.click();
};

const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        // Upload da imagem para Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${session.value.user.id}.${fileExt}`;
        const filePath = `profile-photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        // Obter URL pública
        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Atualizar no banco
        const isAluno = user.value.idaluno !== undefined;
        const tableName = isAluno ? "aluno" : "funcionario";
        const idField = isAluno ? "idaluno" : "idfuncionario";
        const idValue = isAluno ? user.value.idaluno : user.value.idfuncionario;

        const { error: updateError } = await supabase
            .from(tableName)
            .update({ foto: data.publicUrl })
            .eq(idField, idValue);

        if (updateError) throw updateError;

        user.value.foto = data.publicUrl;
        alert('Foto atualizada com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar foto:', error);
        alert('Erro ao atualizar foto: ' + error.message);
    }
};

// ==========================================
// FUNÇÃO DE LOGOUT - DESLOGAR DA CONTA
// ==========================================
// Esta função é responsável por fazer o logout do usuário
// Quando chamada, limpa a sessão do Supabase e remove dados do localStorage
const handleLogout = async () => {
    try {
        // Pede confirmação ao usuário antes de fazer logout
        const confirmar = window.confirm("Tem certeza que deseja fazer logout?");
        
        if (!confirmar) {
            return; // Se o usuário cancelar, não faz nada
        }

        // Chama a função signOut do Supabase
        // Isso:
        // 1. Invalida o token de autenticação no servidor
        // 2. Remove os dados da sessão do localStorage
        // 3. Limpa o estado da sessão
        await signOut();
        
        // Mostra mensagem de sucesso
        alert("Logout realizado com sucesso!");
        
        // Redireciona o usuário para a página de login
        router.push("/login");
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        alert("Erro ao fazer logout: " + error.message);
    }
};

// ==========================================
// FUNÇÃO DE CARREGAR PERFIL
// ==========================================
// Carrega todos os dados do perfil do usuário logado
const loadProfile = async () => {
    // Verifica se o usuário está autenticado
    if (!session.value || !session.value.user?.email) {
        // Se não estiver, redireciona para login
        router.push("/login");
        return;
    }

    const email = session.value.user.email;
    const metadata = session.value.user.user_metadata || {};
    
    // Tenta buscar como aluno primeiro
    let userData = null;
    let isAlunoUser = false;

    // Busca o usuário na tabela de alunos
    const { data: alunoData, error: alunoError } = await supabase
        .from("aluno")
        .select("*")
        .ilike("email", email);

    if (!alunoError && alunoData && alunoData.length > 0) {
        userData = alunoData[0];
        isAlunoUser = true;
    } else {
        // Se não é aluno, tenta buscar como funcionário
        const { data: funcData, error: funcError } = await supabase
            .from("funcionario")
            .select("*")
            .ilike("email", email);

        if (!funcError && funcData && funcData.length > 0) {
            userData = funcData[0];
            isAlunoUser = false;
        }
    }

    if (!userData) {
        alert('Perfil não encontrado. Você precisa completar seu cadastro.');
        router.push('/cadastro');
        return;
    }

    // Enriquece dados com metadata armazenada durante o login
    user.value = {
        ...userData,
        nome: userData.nome || metadata.nome || '',
        sobrenome: userData.sobrenome || metadata.sobrenome || '',
        email: userData.email || email,
    };

    isAluno.value = isAlunoUser;
    setProfileForm();

    // Carrega dados relacionados apenas para alunos
    if (isAlunoUser) {
        const { data: turmaData } = await supabase
            .from("aluno_has_turma")
            .select("turma:turma_id(nome)")
            .eq("aluno_id", userData.idaluno);

        if (turmaData && turmaData.length > 0) {
            turmaNome.value = turmaData[0].turma?.nome || '';
        }

        const { data: entregasData } = await supabase
            .from("aluno_has_epis")
            .select("*, epis:epis_id(nome, tipo, disponivel)")
            .eq("aluno_id", userData.idaluno);

        if (entregasData) {
            episAssigned.value = entregasData;
        }
    }

    const { data: episData } = await supabase.from("epis").select("*");
    if (episData) {
        episAvailable.value = episData;
    }

    loading.value = false;
};

onMounted(loadProfile);
watch(session, () => {
    if (!user.value) loadProfile();
});
</script>

<style scoped>
.perfil-page {
    min-height: 100vh;
    background: #293140;
    color: #edf2f7;
}

.perfil-main {
    display: flex;
    min-height: calc(100vh - 80px);
}

.content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.content-header {
    margin-bottom: 20px;
}

.content-header h1 {
    color: white;
    font-size: 2rem;
    margin-bottom: 5px;
}

.content-header p {
    color: rgba(255, 255, 255, 0.8);
}

.top-panel {
    display: block;
    margin-bottom: 2.5rem;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    overflow: hidden;
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.change-photo-btn {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.3s;
}

.change-photo-btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

.password-section {
    margin: 15px 0;
}

.change-password-btn {
    padding: 10px 20px;
    background: #f05432;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.3s;
}

.change-password-btn:hover {
    background: #e03e1f;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: #262c3d;
    border-radius: 12px;
    padding: 20px;
    width: 90%;
    max-width: 400px;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-content h3 {
    color: white;
    margin-bottom: 20px;
    text-align: center;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 5px;
    font-size: 0.9rem;
}

.form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 0.9rem;
}

.form-group input::placeholder {
    color: rgba(255, 255, 255, 0.6);
}

.modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
}

.modal-actions button {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.3s;
}

.modal-actions .cancel-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.modal-actions .cancel-btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

.modal-actions .save-btn {
    background: #f05432;
    color: white;
}

.modal-actions .save-btn:hover {
    background: #e03e1f;
}

.profile-card,
.epis-panel {
    background: #262c3d;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 1.8rem;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
}

.profile-card-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.8rem;
    justify-content: space-between;
}

.profile-actions {
    display: flex;
    gap: 0.8rem;
    align-items: center;
}

/* ========================================== */
/* ESTILOS DOS BOTÕES DE AÇÃO */
/* ========================================== */
.action-buttons-group {
    display: flex;
    gap: 0.8rem;
    align-items: center;
}

.edit-btn,
.save-btn,
.cancel-btn,
.logout-btn {
    border: none;
    border-radius: 999px;
    padding: 0.65rem 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

/* Botão Editar - cor laranja */
.edit-btn {
    background: #f05432;
    color: white;
}

.edit-btn:hover {
    background: #e74821;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(240, 84, 50, 0.3);
}

/* Botão Logout - cor vermelha para indicar saída da conta */
.logout-btn {
    background: #dc2626;
    color: white;
}

.logout-btn:hover {
    background: #b91c1c;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

/* Botão Salvar - cor verde */
.save-btn {
    background: #1f6b3c;
    color: white;
}

.save-btn:hover {
    background: #15803d;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(31, 107, 60, 0.3);
}

/* Botão Cancelar - transparente com borda */
.cancel-btn {
    background: transparent;
    color: #cbd5e1;
    border: 1px solid rgba(255, 255, 255, 0.12);
}

.cancel-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.3);
}

.info-value {
    display: flex;
    justify-content: flex-end;
    width: 50%;
}

.info-input {
    width: 100%;
    max-width: 220px;
    padding: 0.55rem 0.85rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: #1f2532;
    color: #edf2f7;
}

.info-input:focus {
    outline: none;
    border-color: #f05432;
}

.avatar {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: #3d4555;
    display: grid;
    place-items: center;
    font-size: 2.8rem;
}

.profile-info h1 {
    margin: 0;
    font-size: 2.2rem;
    color: #ffffff;
}

.turma-label {
    margin: 0.35rem 0 0;
    color: #f05432;
    font-weight: 600;
}

.profile-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
}

.info-box {
    background: #1e2331;
    border-radius: 14px;
    padding: 1.2rem;
}

.info-box h2 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: #f05432;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.65rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.info-row:first-of-type {
    border-top: none;
}

.info-row span {
    color: #9ca3af;
}

.info-row strong {
    color: #f8fafc;
}

.epis-header {
    margin-bottom: 1rem;
}

.epis-header h2 {
    margin: 0;
    font-size: 1.6rem;
}

.epis-header p {
    margin: 0.45rem 0 0;
    color: #a0aec0;
}

.epis-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.epi-card {
    background: #1e2331;
    border-radius: 14px;
    padding: 1rem 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
}

.epi-card-title {
    font-size: 1rem;
    font-weight: 700;
    color: #ffffff;
}

.epi-card-subtitle {
    color: #94a3b8;
}

.epi-status {
    margin-top: auto;
    width: fit-content;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
}

.status-disponivel {
    background: #1f6b3c;
    color: #d1fae5;
}

.status-indisponivel {
    background: #7b2d2d;
    color: #ffe4e6;
}

.epi-empty,
.empty-state {
    color: #cbd5e1;
    padding: 1.6rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.04);
}

.solicitacoes-section {
    background: #262c3d;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 1.8rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1.5rem;
}

.section-header h2 {
    margin: 0;
    font-size: 1.6rem;
}

.section-header p {
    margin: 0.4rem 0 0;
    color: #a0aec0;
}

.filter-box input {
    width: 220px;
    padding: 0.9rem 1rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: #1f2532;
    color: #edf2f7;
}

.filter-box input::placeholder {
    color: #94a3b8;
}

.request-list {
    display: grid;
    gap: 0.9rem;
}

.request-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #1e2331;
    border-radius: 14px;
    padding: 1rem 1.2rem;
}

.request-left {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.request-name {
    font-weight: 700;
    color: #ffffff;
}

.request-type {
    color: #94a3b8;
    font-size: 0.92rem;
}

.request-status {
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
}

@media (max-width: 980px) {
    .top-panel {
        grid-template-columns: 1fr;
    }

    .epis-list {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 720px) {
    .perfil-main {
        padding: 1.4rem;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .filter-box input {
        width: 100%;
    }
}
</style>
