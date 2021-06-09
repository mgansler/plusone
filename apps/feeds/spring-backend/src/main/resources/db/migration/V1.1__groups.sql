alter table user_feed
    add column if not exists group_id uuid;

create table if not exists user_group
(
    id      uuid not null,
    name    varchar(255),
    user_id uuid,
    primary key (id)
);

alter table user_feed
    drop constraint if exists FK5monmpt0varwgn9riwpd5ogo6;
alter table user_feed
    add constraint FK5monmpt0varwgn9riwpd5ogo6 foreign key (group_id) references user_group;

alter table user_group
    drop constraint if exists FK9r473a13gq7n3275gf6elhh8n;
alter table user_group
    add constraint FK9r473a13gq7n3275gf6elhh8n foreign key (user_id) references feeds_user;
