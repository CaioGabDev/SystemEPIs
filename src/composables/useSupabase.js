import { createClient } from "@supabase/supabase-js";
import { ref } from "vue";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// estado global reativo
const session = ref(null);
const loadingSession = ref(true);

// pega sessão inicial
supabase.auth.getSession().then(({ data }) => {
  session.value = data.session;
  loadingSession.value = false;
});

// escuta mudanças
supabase.auth.onAuthStateChange((_event, newSession) => {
  session.value = newSession;
});

// Helper para obter tipo de usuário
const getTipoUsuario = () => {
  return session.value?.user?.user_metadata?.tipo || 'aluno';
};

// Helper para verificar se é admin/funcionário
const isAdmin = () => {
  const tipo = getTipoUsuario();
  return tipo === 'funcionario' || tipo === 'admin';
};

// Helper para verificar se é aluno
const isAluno = () => {
  return getTipoUsuario() === 'aluno';
};

export function useSupabase() {
  const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          tipo: userData.type,
          nome: userData.nome,
          sobrenome: userData.sobrenome,
          cpf: userData.cpf,
          funcao: userData.funcao
        }
      }
    });
    
    if (error) throw error;

    console.log('Usuário criado no Auth. O Trigger fará o insert na tabela correta:', data);
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;

    const tipoUsuario = data.user?.user_metadata?.tipo;
    console.log("Login realizado com sucesso. Tipo de perfil:", tipoUsuario);

    return {
      user: data.user,
      session: data.session,
      tipo: tipoUsuario
    };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };
  const getFuncionarios = async () => {
    const { data, error } = await supabase.from("funcionario").select("*");
    if (error) throw error;
    return data;
  };

  const addFuncionario = async (funcionario) => {
    const { data, error } = await supabase
      .from("funcionario")
      .insert([funcionario]);
    if (error) throw error;
    return data;
  };

  const getEPIs = async () => {
    const { data, error } = await supabase.from("epis").select("*");
    if (error) throw error;
    return data;
  };

  const addEPI = async (epi) => {
    const { data, error } = await supabase.from("epis").insert([epi]);
    if (error) throw error;
    return data;
  };

  const getAlunos = async () => {
    const { data, error } = await supabase.from("aluno").select("*");
    if (error) throw error;
    return data;
  };

  const addAluno = async (aluno) => {
    const { data, error } = await supabase.from("aluno").insert([aluno]);
    if (error) throw error;
    return data;
  };

  const getTurmas = async () => {
    const { data, error } = await supabase.from("turma").select("*");
    if (error) throw error;
    return data;
  };

  const addTurma = async (turma) => {
    const { data, error } = await supabase.from("turma").insert([turma]);
    if (error) throw error;
    return data;
  };

  const getEntregasFuncionario = async () => {
    const { data, error } = await supabase.from("funcionario_has_epis").select(`
      *,
      funcionario:funcionario_id (nome, sobrenome),
      epis:epis_id (nome, tipo)
    `);
    if (error) throw error;
    return data;
  };

  const addEntregaFuncionario = async (entrega) => {
    const { data, error } = await supabase
      .from("funcionario_has_epis")
      .insert([entrega]);
    if (error) throw error;
    return data;
  };

  const getEntregasAluno = async () => {
    const { data, error } = await supabase.from("aluno_has_epis").select(`
      *,
      aluno:aluno_id (nome, sobrenome),
      epis:epis_id (nome, tipo)
    `);
    if (error) throw error;
    return data;
  };

  const addEntregaAluno = async (entrega) => {
    const { data, error } = await supabase
      .from("aluno_has_epis")
      .insert([entrega]);
    if (error) throw error;
    return data;
  };

  const getMatriculas = async () => {
    const { data, error } = await supabase.from("aluno_has_turma").select(`
      *,
      aluno:aluno_id (nome, sobrenome),
      turma:turma_id (nome)
    `);
    if (error) throw error;
    return data;
  };

  const addMatricula = async (matricula) => {
    const { data, error } = await supabase
      .from("aluno_has_turma")
      .insert([matricula]);
    if (error) throw error;
    return data;
  };

  // Dashboard - Métodos específicos
  const getDashboardStats = async () => {
    const { data: todos, error: e1 } = await supabase.from("epis").select("*");
    const { data: entregas, error: e2 } = await supabase.from("aluno_has_epis").select("*");
    
    if (e1 || e2) throw new Error('Erro ao buscar estatísticas');
    
    const total = todos.length;
    const emUso = entregas.length;
    const disponivel = total - emUso;
    
    return {
      total,
      disponivel,
      emUso,
      percentualDisponibilidade: total > 0 ? ((disponivel / total) * 100).toFixed(1) : 0
    };
  };

  const getEntregasRecentes = async (limite = 5) => {
    const { data, error } = await supabase.from("aluno_has_epis").select(`
      id_entrega_aluno,
      data_entrega,
      aluno:aluno_id (nome, sobrenome),
      epis:epis_id (nome, tipo)
    `)
    .order('data_entrega', { ascending: false })
    .limit(limite);
    
    if (error) throw error;
    return data;
  };

  const getEstoquePerTipo = async () => {
    const { data, error } = await supabase.from("epis").select("tipo, quantidade");
    if (error) throw error;
    
    const estoque = {};
    data.forEach(epi => {
      if (!estoque[epi.tipo]) {
        estoque[epi.tipo] = 0;
      }
      estoque[epi.tipo] += epi.quantidade || 0;
    });
    
    return Object.entries(estoque).map(([tipo, quantidade]) => ({
      tipo,
      quantidade
    }));
  };

  const alertasEPIs = async () => {
    const { data, error } = await supabase.from("epis")
      .select("*")
      .lt('data_validade', new Date().toISOString().split('T')[0]);
    
    if (error) throw error;
    return data || [];
  };

  const getFuncionarioComEPIs = async () => {
    const { data, error } = await supabase.from("funcionario_has_epis").select(`
      id_entrega_func,
      data_entrega,
      data_devolucao,
      funcionario:funcionario_id (nome, sobrenome, email),
      epis:epis_id (nome, tipo, codigo_patrimonio)
    `)
    .is('data_devolucao', null)
    .limit(10);
    
    if (error) throw error;
    return data;
  };

  const getAlunoComEPIsAtrasados = async () => {
    const { data, error } = await supabase.from("aluno_has_epis").select(`
      id_entrega_aluno,
      data_entrega,
      aluno:aluno_id (nome, sobrenome, email),
      epis:epis_id (nome, tipo, codigo_patrimonio)
    `)
    .limit(10);
    
    if (error) throw error;
    return data || [];
  };

  const deleteEPI = async (id) => {
    const { error } = await supabase.from("epis").delete().eq("idepis", id);
    if (error) throw error;
    return true;
  };

  const updateEPI = async (id, epi) => {
    const { data, error } = await supabase.from("epis").update(epi).eq("idepis", id);
    if (error) throw error;
    return data;
  };

  return {
    supabase,
    session,
    loadingSession,
    signUp,
    signIn,
    signOut,
    getTipoUsuario,
    isAdmin,
    isAluno,
    getFuncionarios,
    addFuncionario,
    getEPIs,
    addEPI,
    getAlunos,
    addAluno,
    getTurmas,
    addTurma,
    getEntregasFuncionario,
    addEntregaFuncionario,
    getEntregasAluno,
    addEntregaAluno,
    getMatriculas,
    addMatricula,
    getDashboardStats,
    getEntregasRecentes,
    getEstoquePerTipo,
    alertasEPIs,
    getFuncionarioComEPIs,
    getAlunoComEPIsAtrasados,
    deleteEPI,
    updateEPI
  };
}