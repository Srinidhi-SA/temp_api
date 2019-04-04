# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2019-03-08 10:05
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0061_stockdataset_crawled_data'),
    ]

    operations = [
        migrations.CreateModel(
            name='TrainAlgorithmMapping',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=300, null=True)),
                ('slug', models.SlugField(blank=True, max_length=300)),
                ('config', models.TextField(default='{}')),
                ('data', models.TextField(default='{}')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('deleted', models.BooleanField(db_index=True, default=False)),
                ('bookmarked', models.BooleanField(default=False)),
                ('viewed', models.BooleanField(default=False)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('trainer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.Trainer')),
            ],
            options={
                'ordering': ['-created_at', '-updated_at'],
            },
        ),
        migrations.AlterModelOptions(
            name='dataset',
            options={'ordering': ['-created_at', '-updated_at'], 'permissions': (('view_dataset', 'View dataset'), ('create_dataset', 'Create dataset'), ('rename_dataset', 'Rename dataset'), ('remove_dataset', 'remove dataset'), ('upload_from_file', 'Upload from file'), ('upload_from_mysql', 'Upload from mysql'), ('upload_from_mssql', 'Upload from mssql'), ('upload_from_hdfs', 'Upload from hdfs'), ('upload_from_hana', 'Upload from hana'), ('upload_from_s3', 'Upload from s3'), ('data_validation', 'Data Validation'), ('subsetting_dataset', 'Subsetting dataset'))},
        ),
    ]