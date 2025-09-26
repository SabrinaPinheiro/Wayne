-- Atualizar perfis dos usuários demo com nomes mais realistas
UPDATE public.profiles 
SET full_name = 'Bruce Wayne - CEO'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br');

UPDATE public.profiles 
SET full_name = 'Alfred Pennyworth - Gerente Operacional'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br');

UPDATE public.profiles 
SET full_name = 'Robin Blake - Segurança'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br');

-- Limpar dados inconsistentes existentes
DELETE FROM public.alerts WHERE user_id NOT IN (
  SELECT id FROM auth.users WHERE email IN ('admin@wayne.app.br', 'gerente@wayne.app.br', 'funcionario@wayne.app.br')
);

DELETE FROM public.access_logs WHERE user_id NOT IN (
  SELECT id FROM auth.users WHERE email IN ('admin@wayne.app.br', 'gerente@wayne.app.br', 'funcionario@wayne.app.br')
);

-- Popular tabela de recursos com equipamentos da Wayne Industries
INSERT INTO public.resources (name, type, description, status, location, created_by) VALUES
-- Veículos
('Batmóvel Mark VII', 'veiculo', 'Veículo blindado com propulsão a jato e sistemas defensivos avançados', 'disponivel', 'Batcaverna - Hangar Principal', (SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br')),
('Batwing', 'veiculo', 'Aeronave de combate com capacidade stealth e armamento pesado', 'manutencao', 'Hangar Aéreo - Nível 3', (SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br')),
('Batboat', 'veiculo', 'Embarcação aquática de alta velocidade para operações marítimas', 'disponivel', 'Doca Subterrânea', (SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br')),
('Batmoto Stealth', 'veiculo', 'Motocicleta de alta performance para patrulhamento urbano', 'em_uso', 'Garagem - Setor B', (SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br')),

-- Equipamentos de Campo
('Traje Tático Mark V', 'equipamento', 'Traje com proteção balística avançada e sistemas integrados', 'disponivel', 'Armário de Equipamentos - A1', (SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br')),
('Cinto de Utilidades Premium', 'equipamento', 'Arsenal portátil com gadgets especializados e ferramentas táticas', 'disponivel', 'Armário de Equipamentos - A2', (SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br')),
('Grappling Gun V3', 'equipamento', 'Dispositivo de escalada com cabo de alta resistência', 'manutencao', 'Oficina de Equipamentos', (SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br')),
('Kit Batarrangs', 'equipamento', '12 unidades de projéteis não-letais de alta precisão', 'disponivel', 'Arsenal - Setor C', (SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br')),
('Detector de Explosivos', 'dispositivo', 'Scanner portátil para detecção de materiais perigosos', 'disponivel', 'Laboratório de Análise', (SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br')),

-- Equipamentos Tecnológicos
('Computador Principal Quantum', 'equipamento', 'Supercomputador quântico com IA integrada para análise de dados', 'em_uso', 'Centro de Comando - Núcleo', (SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br')),
('Sistema de Vigilância ARGUS', 'equipamento', 'Rede de câmeras com reconhecimento facial e análise comportamental', 'em_uso', 'Centro de Monitoramento', (SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br')),
('Scanner Biométrico', 'dispositivo', 'Dispositivo de identificação por impressão digital e íris', 'disponivel', 'Entrada Principal', (SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br')),
('Comunicador Seguro', 'dispositivo', 'Sistema de comunicação encriptada de longo alcance', 'disponivel', 'Centro de Comunicações', (SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br')),

-- Instalações como Equipamentos
('Sala de Treinamento Alpha', 'equipamento', 'Ambiente controlado para treinamento físico e combate', 'disponivel', 'Subsolo - Nível 2', (SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br')),
('Laboratório de Análise Forense', 'equipamento', 'Laboratório equipado para análise de evidências e materiais', 'em_uso', 'Ala Científica', (SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br')),
('Sala de Reuniões Segura', 'equipamento', 'Ambiente blindado para reuniões confidenciais', 'disponivel', 'Andar Executivo', (SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br')),
('Centro de Monitoramento 24h', 'equipamento', 'Central de vigilância com operação contínua', 'em_uso', 'Torre de Controle', (SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br')),

-- Equipamentos de Segurança
('Sistema de Alarme Perimetral', 'dispositivo', 'Rede de sensores de movimento e intrusão', 'em_uso', 'Perímetro Externo', (SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br')),
('Cofre de Segurança Máxima', 'equipamento', 'Cofre com fechadura biométrica tripla para itens críticos', 'disponivel', 'Câmara Forte', (SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br')),
('Kit Primeiros Socorros Avançado', 'equipamento', 'Equipamentos médicos para emergências em campo', 'disponivel', 'Enfermaria', (SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br')),
('Gerador de Emergência', 'equipamento', 'Fonte de energia backup com autonomia de 72 horas', 'disponivel', 'Subsolo - Energia', (SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'));

-- Popular logs de acesso com histórico realista dos últimos 30 dias
INSERT INTO public.access_logs (user_id, resource_id, action, notes, timestamp) VALUES
-- Atividades do Administrador (Bruce Wayne) - últimos 30 dias
((SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Computador Principal Quantum'), 'acesso', 'Verificação rotineira dos sistemas de segurança', NOW() - INTERVAL '1 hour'),
((SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Sistema de Vigilância ARGUS'), 'acesso', 'Análise de atividades suspeitas no distrito financeiro', NOW() - INTERVAL '3 hours'),
((SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Batmóvel Mark VII'), 'checkout', 'Patrulhamento noturno - Setor Leste', NOW() - INTERVAL '1 day 2 hours'),
((SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Batmóvel Mark VII'), 'checkin', 'Retorno da missão - sem danos reportados', NOW() - INTERVAL '1 day'),
((SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Traje Tático Mark V'), 'checkout', 'Operação especial na zona portuária', NOW() - INTERVAL '2 days 1 hour'),
((SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Traje Tático Mark V'), 'checkin', 'Equipamento retornado após limpeza', NOW() - INTERVAL '2 days'),
((SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Sala de Reuniões Segura'), 'acesso', 'Reunião com contatos da polícia', NOW() - INTERVAL '3 days'),
((SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Cofre de Segurança Máxima'), 'acesso', 'Retirada de documentos confidenciais', NOW() - INTERVAL '5 days'),
((SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Sistema de Alarme Perimetral'), 'manutencao', 'Atualização de firmware dos sensores', NOW() - INTERVAL '7 days'),
((SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Batwing'), 'manutencao', 'Manutenção preventiva do sistema de propulsão', NOW() - INTERVAL '10 days'),

-- Atividades do Gerente (Alfred Pennyworth) - últimos 30 dias
((SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Laboratório de Análise Forense'), 'acesso', 'Supervisão da análise de evidências coletadas', NOW() - INTERVAL '2 hours'),
((SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Scanner Biométrico'), 'manutencao', 'Calibração dos sensores de identificação', NOW() - INTERVAL '4 hours'),
((SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Cinto de Utilidades Premium'), 'checkout', 'Inspeção de equipamentos para missão', NOW() - INTERVAL '6 hours'),
((SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Cinto de Utilidades Premium'), 'checkin', 'Reabastecimento de suprimentos concluído', NOW() - INTERVAL '5 hours'),
((SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Batboat'), 'checkout', 'Teste de desempenho após manutenção', NOW() - INTERVAL '1 day 3 hours'),
((SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Batboat'), 'checkin', 'Teste aprovado - embarcação operacional', NOW() - INTERVAL '1 day 2 hours'),
((SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Detector de Explosivos'), 'acesso', 'Verificação de calibração semanal', NOW() - INTERVAL '2 days'),
((SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Kit Primeiros Socorros Avançado'), 'manutencao', 'Reposição de medicamentos vencidos', NOW() - INTERVAL '4 days'),
((SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Grappling Gun V3'), 'manutencao', 'Reparo do mecanismo de retração', NOW() - INTERVAL '6 days'),
((SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Gerador de Emergência'), 'manutencao', 'Teste mensal de funcionamento', NOW() - INTERVAL '15 days'),

-- Atividades do Funcionário (Robin Blake) - últimos 30 dias
((SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Centro de Monitoramento 24h'), 'acesso', 'Início do turno noturno de vigilância', NOW() - INTERVAL '30 minutes'),
((SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Comunicador Seguro'), 'checkout', 'Patrulhamento do perímetro norte', NOW() - INTERVAL '1 hour 30 minutes'),
((SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Batmoto Stealth'), 'checkout', 'Ronda de segurança - Zona Industrial', NOW() - INTERVAL '4 hours'),
((SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Batmoto Stealth'), 'checkin', 'Patrulhamento concluído sem ocorrências', NOW() - INTERVAL '3 hours'),
((SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Kit Batarrangs'), 'checkout', 'Treinamento de precisão no campo de tiro', NOW() - INTERVAL '1 day'),
((SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Kit Batarrangs'), 'checkin', 'Sessão de treinamento finalizada', NOW() - INTERVAL '23 hours'),
((SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Sala de Treinamento Alpha'), 'acesso', 'Treinamento físico matinal', NOW() - INTERVAL '2 days'),
((SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Comunicador Seguro'), 'checkin', 'Fim do turno - equipamento devolvido', NOW() - INTERVAL '1 hour'),
((SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Centro de Monitoramento 24h'), 'acesso', 'Monitoramento dos sistemas de segurança', NOW() - INTERVAL '3 days'),
((SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br'), (SELECT id FROM public.resources WHERE name = 'Scanner Biométrico'), 'acesso', 'Teste de funcionalidade dos acessos', NOW() - INTERVAL '7 days');

-- Popular alertas contextuais para cada tipo de usuário
INSERT INTO public.alerts (user_id, type, message, status, created_at, read_at) VALUES
-- Alertas para o Administrador (Bruce Wayne)
((SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br'), 'error', 'Sistema de Vigilância ARGUS detectou atividade suspeita no distrito financeiro', 'unread', NOW() - INTERVAL '15 minutes', NULL),
((SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br'), 'warning', 'Manutenção programada do Batwing será iniciada em 48 horas', 'unread', NOW() - INTERVAL '2 hours', NULL),
((SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br'), 'info', 'Relatório semanal de segurança disponível para revisão', 'read', NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours'),
((SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br'), 'error', 'Tentativa de acesso não autorizado detectada no perímetro leste', 'read', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day 20 hours'),
((SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br'), 'warning', 'Cofre de Segurança Máxima: última verificação há mais de 7 dias', 'unread', NOW() - INTERVAL '3 days', NULL),
((SELECT id FROM auth.users WHERE email = 'admin@wayne.app.br'), 'info', 'Atualização de firmware disponível para Sistema de Alarme Perimetral', 'read', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),

-- Alertas para o Gerente (Alfred Pennyworth)
((SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'), 'warning', 'Grappling Gun V3 ainda em manutenção - prazo estimado: 2 dias', 'unread', NOW() - INTERVAL '1 hour', NULL),
((SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'), 'info', 'Reposição de suprimentos médicos necessária no Kit Primeiros Socorros', 'unread', NOW() - INTERVAL '3 hours', NULL),
((SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'), 'info', 'Teste mensal do Gerador de Emergência agendado para amanhã', 'read', NOW() - INTERVAL '1 day', NOW() - INTERVAL '6 hours'),
((SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'), 'warning', 'Scanner Biométrico apresentou 3 falhas de leitura hoje', 'read', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
((SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'), 'info', 'Laboratório de Análise: 2 amostras pendentes de processamento', 'unread', NOW() - INTERVAL '4 days', NULL),
((SELECT id FROM auth.users WHERE email = 'gerente@wayne.app.br'), 'info', 'Relatório de manutenção preventiva deve ser enviado até sexta-feira', 'read', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days'),

-- Alertas para o Funcionário (Robin Blake)
((SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br'), 'info', 'Lembrete: Treinamento de atualização em segurança agendado para segunda-feira', 'unread', NOW() - INTERVAL '30 minutes', NULL),
((SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br'), 'info', 'Kit Batarrangs disponível para sessão de treinamento', 'read', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'),
((SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br'), 'warning', 'Comunicador Seguro: bateria em 15% - favor recarregar', 'unread', NOW() - INTERVAL '4 hours', NULL),
((SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br'), 'info', 'Sala de Treinamento Alpha reservada para você amanhã às 06:00', 'unread', NOW() - INTERVAL '1 day', NULL),
((SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br'), 'success', 'Parabéns! 30 dias sem incidentes de segurança', 'read', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
((SELECT id FROM auth.users WHERE email = 'funcionario@wayne.app.br'), 'info', 'Nova rota de patrulhamento disponível no sistema', 'read', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days');