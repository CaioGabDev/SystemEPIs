<template>
    <div class="perfil-page">
        <HeaderAluno />
        <main class="perfil-main">
            <SidebarAluno />
            <section class="content">
                <div class="content-header">
                    <h1>Perfil do Aluno</h1>
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
                            <div class="info-row">
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
                                <span>Função</span><strong>Aluno</strong>
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
import SidebarAluno from "../components/SidebarAluno.vue";
import { ref, computed, onMounted, watch } from "vue";

// Importa o composable de Supabase que contém todas as funções de autenticação
import { useSupabase } from "../composables/useSupabase";
// Importa o router do Vue para navegação entre páginas
import { useRouter } from "vue-router";


// Desestrutura as funções e estado do Supabase
const { session, supabase, signOut } = useSupabase();
const router = useRouter();


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
// Modal para alterar senha
const showPasswordModal = ref(false);
const passwordData = ref({
    current: '',
    new: '',
    confirm: ''
});
// Ref para input de foto
const photoInput = ref(null);


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

        // Atualiza na tabela de alunos
        const { data: updated, error } = await supabase
            .from("aluno")
            .update(updateData)
            .eq("idaluno", user.value.idaluno)
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

//Altera senha e foto
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
        const { error: updateError } = await supabase
            .from("aluno")
            .update({ foto: data.publicUrl })
            .eq("idaluno", user.value.idaluno);

        if (updateError) throw updateError;

        user.value.foto = data.publicUrl;
        alert('Foto atualizada com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar foto:', error);
        alert('Erro ao atualizar foto: ' + error.message);
    }
};


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
    
    // Busca o usuário na tabela de alunos
    const { data: alunoData, error: alunoError } = await supabase
        .from("aluno")
        .select("*")
        .ilike("email", email);

    if (alunoError || !alunoData || alunoData.length === 0) {
        alert('Perfil de aluno não encontrado. Você precisa completar seu cadastro.');
        router.push('/cadastro');
        return;
    }

    const userData = alunoData[0];

    // Enriquece dados com metadata armazenada durante o login
    user.value = {
        ...userData,
        nome: userData.nome || metadata.nome || '',
        sobrenome: userData.sobrenome || metadata.sobrenome || '',
        email: userData.email || email,
    };

    setProfileForm();

    // Carrega dados relacionados do aluno
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
    color: #a0aec0;
    font-size: 1rem;
}

.profile-card {
    background: #1a202c;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.profile-card-header {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #2d3748;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #2d3748;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 3px solid #f44336;
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar i {
    font-size: 2.5rem;
    color: #f44336;
}

.change-photo-btn {
    padding: 6px 12px;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: background 0.3s ease;
}

.change-photo-btn:hover {
    background: #f44336;
}

.profile-info {
    flex: 1;
}

.profile-info h1 {
    color: white;
    font-size: 1.8rem;
    margin-bottom: 5px;
}

.turma-label {
    color: #a0aec0;
    font-size: 0.95rem;
}

.profile-actions {
    display: flex;
    gap: 10px;
}

.action-buttons-group,
.edit-actions {
    display: flex;
    gap: 10px;
}

.edit-btn,
.logout-btn,
.change-password-btn,
.save-btn,
.cancel-btn {
    padding: 10px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.edit-btn {
    background: #f44336;
    color: white;
}

.edit-btn:hover {
    background: #f44336;
}

.logout-btn {
    background: #ff0000;
    color: white;
}

.logout-btn:hover {
    background: #e53e3e;
}

.save-btn {
    background: #48bb78;
    color: white;
}

.save-btn:hover {
    background: #38a169;
}

.cancel-btn {
    background: #718096;
    color: white;
}

.cancel-btn:hover {
    background: #4a5568;
}

.change-password-btn {
    background: #ed8936;
    color: white;
}

.change-password-btn:hover {
    background: #dd6b20;
}

.profile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}

.info-box {
    background: #2d3748;
    padding: 20px;
    border-radius: 6px;
}

.info-box h2 {
    color: #f44336;
    font-size: 1.1rem;
    margin-bottom: 15px;
    border-bottom: 2px solid #f44336;
    padding-bottom: 10px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #1a202c;
}

.info-row:last-child {
    border-bottom: none;
}

.info-row span {
    color: #a0aec0;
    font-weight: 500;
}

.info-value {
    text-align: right;
    flex: 1;
    margin-left: 10px;
}

.info-value strong {
    color: #e2e8f0;
}

.info-input {
    background: #1a202c;
    color: #e2e8f0;
    border: 1px solid #4299e1;
    padding: 8px;
    border-radius: 4px;
    font-size: 0.95rem;
}

.info-input:focus {
    outline: none;
    border-color: #63b3ed;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.password-section {
    text-align: center;
    margin: 10px 0;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: #1a202c;
    padding: 30px;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.modal-content h3 {
    color: white;
    margin-bottom: 20px;
    font-size: 1.3rem;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    color: #a0aec0;
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
}

.form-group input {
    width: 100%;
    padding: 10px;
    background: #2d3748;
    color: #e2e8f0;
    border: 1px solid #4299e1;
    border-radius: 4px;
    box-sizing: border-box;
}

.form-group input:focus {
    outline: none;
    border-color: #63b3ed;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}

.modal-actions button {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

@media (max-width: 768px) {
    .profile-card-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .profile-info {
        width: 100%;
    }

    .profile-actions {
        width: 100%;
        justify-content: center;
    }

    .profile-grid {
        grid-template-columns: 1fr;
    }

    .info-row {
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
    }

    .info-value {
        text-align: left;
        margin-left: 0;
        margin-top: 5px;
    }
}
</style>