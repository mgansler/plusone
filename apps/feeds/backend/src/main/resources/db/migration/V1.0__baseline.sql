create table if not exists article (id uuid not null, author varchar(255), content text, link varchar(255), published_date timestamp, title text, updated_date timestamp, feed_id uuid, primary key (id));
create table if not exists feed (id uuid not null, has_fetch_error boolean, icon varchar(255), title varchar(255), uri varchar(255) not null, primary key (id));
create table if not exists feeds_user (id uuid not null, avatar_url varchar(255), email varchar(255), name varchar(255), username varchar(255) not null, primary key (id));
create table if not exists user_article (id uuid not null, unread boolean, article_id uuid, user_id uuid, primary key (id));
create table if not exists user_feed (id uuid not null, feed_id uuid, user_id uuid, primary key (id));

alter table article drop constraint if exists UK_oneuf1gn26d7hnunsn1oix6ju;
alter table article add constraint UK_oneuf1gn26d7hnunsn1oix6ju unique (link);
alter table feed drop constraint if exists  UK_a56v4sb533oulfvlh643ik8vu;
alter table feed add constraint UK_a56v4sb533oulfvlh643ik8vu unique (uri);
alter table article add constraint FKqft6wk7f6tx6mvm9h6ssa4ea1 foreign key (feed_id) references feed;
alter table user_article add constraint FKa5197fmolnjvgthw13nd6ykbc foreign key (article_id) references article;
alter table user_article add constraint FK39o7pxa0jfefs341js7i9xl48 foreign key (user_id) references feeds_user;
alter table user_feed add constraint FKsbf0aytwijbwfv3uxmwa6ceix foreign key (feed_id) references feed;
alter table user_feed add constraint FK5e3dbv61h3arnb09u37akpeqj foreign key (user_id) references feeds_user;
