using Fatura.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Fatura.Server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Compra> Compras => Set<Compra>();
    public DbSet<CompraRecorrente> ComprasRecorrentes => Set<CompraRecorrente>();
    public DbSet<Parcela> Parcelas => Set<Parcela>();
    public DbSet<FaturaEntity> Faturas => Set<FaturaEntity>();
    public DbSet<Fornecedor> Fornecedores => Set<Fornecedor>();
    public DbSet<Simulacao> Simulacoes => Set<Simulacao>();
    public DbSet<SimulacaoParcela> SimulacaoParcelas => Set<SimulacaoParcela>();
    public DbSet<InstituicaoFinanceira> InstituicoesFinanceiras => Set<InstituicaoFinanceira>();
    public DbSet<ContaFinanceira> ContasFinanceiras => Set<ContaFinanceira>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Subcategoria> Subcategorias => Set<Subcategoria>();
    public DbSet<LancamentoFinanceiro> LancamentosFinanceiros => Set<LancamentoFinanceiro>();
    public DbSet<LembretePagamento> LembretesPagamento => Set<LembretePagamento>();
    public DbSet<LembretePagamentoHistorico> LembretesPagamentoHistoricos => Set<LembretePagamentoHistorico>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.PasswordHash).IsRequired();
        });

        // Compra
        modelBuilder.Entity<Compra>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ValorTotal).HasPrecision(18, 2);

            entity.HasOne(e => e.Fornecedor)
                  .WithMany(f => f.Compras)
                  .HasForeignKey(e => e.FornecedorId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Compras)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ContaFinanceira)
                  .WithMany()
                  .HasForeignKey(e => e.ContaFinanceiraId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Categoria)
                  .WithMany()
                  .HasForeignKey(e => e.CategoriaId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Subcategoria)
                  .WithMany()
                  .HasForeignKey(e => e.SubcategoriaId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<CompraRecorrente>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ValorMensal).HasPrecision(18, 2);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.ComprasRecorrentes)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ContaFinanceira)
                  .WithMany()
                  .HasForeignKey(e => e.ContaFinanceiraId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Categoria)
                  .WithMany()
                  .HasForeignKey(e => e.CategoriaId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Subcategoria)
                  .WithMany()
                  .HasForeignKey(e => e.SubcategoriaId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Parcela
        modelBuilder.Entity<Parcela>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Valor).HasPrecision(18, 2);

            entity.HasOne(e => e.Compra)
                  .WithMany(c => c.Parcelas)
                  .HasForeignKey(e => e.CompraId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.CompraRecorrente)
                  .WithMany(c => c.Parcelas)
                  .HasForeignKey(e => e.CompraRecorrenteId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Fatura)
                  .WithMany(f => f.Parcelas)
                  .HasForeignKey(e => e.FaturaId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // FaturaEntity (tabela "Faturas")
        modelBuilder.Entity<FaturaEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ValorTotal).HasPrecision(18, 2);

            // Índice único por mês/ano/usuário
            entity.HasIndex(e => new { e.Mes, e.Ano, e.UserId }).IsUnique();

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Faturas)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Fornecedor
        modelBuilder.Entity<Fornecedor>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(200);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Fornecedores)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<InstituicaoFinanceira>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(200);
            entity.HasIndex(e => new { e.UserId, e.Nome }).IsUnique();

            entity.HasOne(e => e.User)
                  .WithMany(u => u.InstituicoesFinanceiras)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ContaFinanceira>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Tipo).IsRequired();
            entity.HasIndex(e => new { e.UserId, e.InstituicaoId, e.Nome }).IsUnique();

            entity.HasOne(e => e.Instituicao)
                  .WithMany(i => i.Contas)
                  .HasForeignKey(e => e.InstituicaoId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.ContasFinanceiras)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Categoria>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Tipo).IsRequired();
            entity.HasIndex(e => new { e.UserId, e.Tipo, e.Nome }).IsUnique();

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Categorias)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Subcategoria>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(150);
            entity.HasIndex(e => new { e.UserId, e.CategoriaId, e.Nome }).IsUnique();

            entity.HasOne(e => e.Categoria)
                  .WithMany(c => c.Subcategorias)
                  .HasForeignKey(e => e.CategoriaId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Subcategorias)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LancamentoFinanceiro>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Valor).HasPrecision(18, 2);
            entity.Property(e => e.Descricao).HasMaxLength(500);
            entity.Property(e => e.Tipo).IsRequired();
            entity.Property(e => e.Origem).IsRequired();
            entity.HasIndex(e => new { e.Origem, e.OrigemId }).IsUnique().HasDatabaseName("UX_Lancamento_Origem");
            entity.HasIndex(e => new { e.UserId, e.Data, e.Tipo });

            entity.HasOne(e => e.Categoria)
                  .WithMany(c => c.Lancamentos)
                  .HasForeignKey(e => e.CategoriaId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Subcategoria)
                  .WithMany(s => s.Lancamentos)
                  .HasForeignKey(e => e.SubcategoriaId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.ContaFinanceira)
                  .WithMany(c => c.Lancamentos)
                  .HasForeignKey(e => e.ContaFinanceiraId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.LancamentosFinanceiros)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LembretePagamento>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NomeConta).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ValorConta).HasPrecision(18, 2);
            entity.Property(e => e.DataCriacao).IsRequired();
            entity.HasIndex(e => e.UserId);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.LembretesPagamento)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LembretePagamentoHistorico>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TipoEnvio).IsRequired();
            entity.Property(e => e.Canal).IsRequired();
            entity.Property(e => e.DataReferencia).IsRequired();
            entity.Property(e => e.DataEnvio).IsRequired();
            entity.HasIndex(e => e.LembretePagamentoId);
            entity.HasIndex(e => new { e.LembretePagamentoId, e.DataReferencia, e.TipoEnvio, e.Canal })
                  .IsUnique();

            entity.HasOne(e => e.LembretePagamento)
                  .WithMany(l => l.Historicos)
                  .HasForeignKey(e => e.LembretePagamentoId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Simulacao
        modelBuilder.Entity<Simulacao>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).HasMaxLength(200);
            entity.Property(e => e.ValorTotal).HasPrecision(18, 2);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Simulacoes)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ContaFinanceira)
                  .WithMany()
                  .HasForeignKey(e => e.ContaFinanceiraId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Categoria)
                  .WithMany()
                  .HasForeignKey(e => e.CategoriaId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Subcategoria)
                  .WithMany()
                  .HasForeignKey(e => e.SubcategoriaId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // SimulacaoParcela
        modelBuilder.Entity<SimulacaoParcela>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Valor).HasPrecision(18, 2);

            entity.HasOne(e => e.Simulacao)
                  .WithMany(s => s.Parcelas)
                  .HasForeignKey(e => e.SimulacaoId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
