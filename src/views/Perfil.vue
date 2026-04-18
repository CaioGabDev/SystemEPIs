<template>
    <div class="perfil-page">
        <HeaderGeral />
        <main class="perfil-main">
            <section class="top-panel">
                <div class="profile-card">
                    <div class="profile-card-header">
                        <div class="avatar">👤</div>
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
                                <span>Função</span><strong>Aluno</strong>
                            </div>
                            <div class="info-row">
                                <span>Senha</span><strong>********</strong>
                            </div>
                            <div class="info-row">
                                <span>Status</span><strong>Ativo</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="epis-panel">
                    <div class="epis-header">
                        <h2>Seus EPIs</h2>
                        <p>Itens que já estão vinculados ao seu perfil</p>
                    </div>
                    <div class="epis-list">
                        <div v-if="episAssigned.length === 0" class="epi-empty">
                            Nenhum EPI registrado ainda.
                        </div>
                        <div v-for="item in episAssigned" :key="item.id_entrega_aluno" class="epi-card">
                            <div class="epi-card-title">{{ item.epis?.nome || "EPI" }}</div>
                            <div class="epi-card-subtitle">
                                {{ item.epis?.tipo || "Tipo não informado" }}
                            </div>
                            <div class="epi-status" :class="item.epis?.disponivel
                                    ? 'status-disponivel'
                                    : 'status-indisponivel'
                                ">
                                {{ item.epis?.disponivel ? "Disponível" : "Indisponível" }}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="solicitacoes-section">
                <div class="section-header">
                    <div>
                        <h2>Minhas Solicitações</h2>
                        <p>Veja o status dos EPIs que você pode solicitar.</p>
                    </div>
                    <div class="filter-box">
                        <input v-model="filterQuery" placeholder="Filtrar" />
                    </div>
                </div>

                <div class="request-list">
                    <div v-for="epi in filteredEpis" :key="epi.idepis" class="request-item">
                        <div class="request-left">
                            <span class="request-name">{{ epi.nome }}</span>
                            <span class="request-type">{{ epi.tipo || "EPI" }}</span>
                        </div>
                        <div class="request-status" :class="epi.disponivel ? 'status-disponivel' : 'status-indisponivel'
                            ">
                            {{ epi.disponivel ? "Disponível" : "Indisponível" }}
                        </div>
                    </div>
                    <div v-if="filteredEpis.length === 0" class="empty-state">
                        Nenhuma solicitação encontrada.
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import HeaderGeral from "../components/HeaderGeral.vue";
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
    background: #1f2532;
    color: #edf2f7;
}

.perfil-main {
    width: min(1200px, 100%);
    margin: 0 auto;
    padding: 2rem 2rem 4rem;
}

.top-panel {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 2rem;
    margin-bottom: 2.5rem;
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
