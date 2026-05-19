update core.app_user
set password_hash = 'admin123'
where firm_id = 'BRT01' and upper(user_code) = 'ADMIN';
