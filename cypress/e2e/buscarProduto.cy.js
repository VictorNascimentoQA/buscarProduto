describe('Funcionalidade de Busca na Amazon', () => {

    beforeEach(() => {
        cy.intercept('POST', '**/1/events/com.amazon.csm.csa.prod').as('carregarProdutos');
        // Acessar a página inicial usando a baseUrl
        cy.visit('/');
        cy.wait('@carregarProdutos');
    });



    it('# Cenário 1: Buscar produto por palavra-chave', () => {
        // Digita "smartphone" no campo de busca e pressiona Enter
        cy.get('#twotabsearchtextbox').type('Smartphone{enter}');

        // Verifica se o sistema exibe uma lista de produtos relacionados
        cy.get('.s-main-slot .s-result-item').should('have.length.greaterThan', 0);

        // Verifica se o primeiro produto possui nome, imagem, preço e avaliação
        cy.get('.s-main-slot .sg-col-inner').first().within(() => {
            cy.get('.a-text-normal').should('exist'); // Nome
            cy.get('.s-image').should('exist'); // Imagem
            cy.get('.a-price').should('exist'); // Preço
            cy.get('.s-underline-text').should('exist'); // Avaliação
        });
    });


    it('# Cenário 2: Buscar produto com sugestões automáticas', () => {
        // Começa a digitar "notebook" no campo de busca
        cy.get('#twotabsearchtextbox').type('notebook');

        // Verifica se as sugestões automáticas são exibidas
        cy.get('.s-suggestion').should('have.length.greaterThan', 0);

        // Clica na primeira sugestão
        cy.get('.s-suggestion').first().click();

        // Verifica se o primeiro produto possui a palavra Notebook
        cy.get('.s-main-slot .sg-col-inner').first().within(() => {
            cy.get('.a-text-normal').contains('Notebook');
        });
    });

    it('# Cenário 3: Buscar produto por categoria', () => {
        cy.wait(1000)
        // Seleciona a categoria "Eletrônicos" no filtro de categorias na busca
        cy.get('select#searchDropdownBox').then(($select) => {
            if ($select.length > 0) {
                cy.wrap($select).select('search-alias=electronics', { force: true });
            } else {
                cy.reload();
            }
        });
        // Realiza a busca genérica após selecionar a categoria
        cy.get('#twotabsearchtextbox').type('{enter}');

        // Verifica se a categoria "Eletrônicos" está selecionada
        cy.get('#nav-subnav').should('be.visible').within(() => {
            cy.get('.nav-a.nav-b').first().should('contain.text', 'Eletrônicos');
        });

        // Verifica que há pelo menos um item na lista de produtos
        cy.get('.apb-default-slot').should('have.length.at.least', 1);
    });

    it('# Cenário 4: Aplicar filtro de faixa de preço', () => {
        const minSliderValue = 62;
        const maxSliderValue = 114;
        const expectedPriceMin = 3.200;  // Exemplo de valor esperado para o preço mínimo
        const expectedPriceMax = 14.700; // Exemplo de valor esperado para o preço máximo

        // Realiza uma busca genérica
        cy.get('#twotabsearchtextbox').type('Smartphone{enter}');
        cy.wait('@carregarProdutos');  // Espera para garantir que os produtos carregaram

        // Função para ajustar o slider
        const setSliderValue = (sliderSelector, value) => {
            cy.get(sliderSelector)
                .invoke('val', value)
                .trigger('change', { force: true })
                .invoke('val').should('eq', value.toString()); // Verifica se o valor foi alterado corretamente
        };

        // Ajuste os valores do slider de preço
        setSliderValue('#p_36\\/range-slider_slider-item_lower-bound-slider', minSliderValue);
        setSliderValue('#p_36\\/range-slider_slider-item_upper-bound-slider', maxSliderValue);

        // Clica no botão "Ir" para aplicar a faixa de preço
        cy.get('.sf-submit-range-button .a-button-input').click();
        cy.wait(3000); // Aguarde para garantir que a filtragem foi aplicada

        // Verifica que os resultados foram filtrados e há produtos na lista
        cy.get('.s-main-slot .s-result-item').should('have.length.greaterThan', 0);

        // Verifica o preço do primeiro produto
        cy.get('.s-main-slot .sg-col-inner').first().within(() => {
            cy.get('.a-price').first().within(() => {
                cy.get('.a-offscreen').invoke('text').then((priceText) => {
                    const priceFormatted = priceText.replace('R$', '').replace(/\s+/g, '').replace(',', '.');
                    const price = parseFloat(priceFormatted); // Converte para número de ponto flutuante

                    // Verifica se o preço está dentro da faixa esperada
                    expect(price).to.be.within(expectedPriceMin, expectedPriceMax);
                });
            });
        });
    });

    it('# Cenário 5: Buscar produto filtrando por avaliação mínima', () => {
        // Realiza uma busca por "smartphone"
        cy.get('#twotabsearchtextbox').type('Smartphone{enter}');
    
        // Aplica o filtro de avaliação "4 estrelas e acima"
        cy.get('.a-star-medium-4') // Localiza o filtro de "4 estrelas"
            .click(); // Aplica o filtro
    
        cy.wait(3000); // Aguarda o sistema aplicar o filtro e carregar os resultados
    
        // Verifica que os resultados foram filtrados e há produtos na lista
        cy.get('.s-main-slot .s-result-item').should('have.length.greaterThan', 0);
    
        // Verifica se todos os itens têm avaliação de 4 estrelas ou mais
        cy.get('.s-main-slot .sg-col-inner').first().within(() => {
            cy.get('.a-size-small .a-icon-alt').invoke('text').then((ratingText) => {
                const rating = parseFloat(ratingText.replace(' de 5 estrelas', '').replace(',', '.'));
                expect(rating).to.be.within(4.0, 5.0); // Verifica se a avaliação está entre 4.0 e 5.0
            });
        });
    });
    

});

