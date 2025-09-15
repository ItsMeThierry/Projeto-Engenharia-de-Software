import React, { useState } from 'react';

function Archives() {
    return (
        <div class='page'>
            <ContentGroup title='Circuito RC' description='Nesse conteúdo vemos o circuito RC, suas fórmulas e utilidades como filtros' contents={[{ name: "Exercícios Práticos", type: "pdf", size: "3 MB" }]}/>
            <ContentGroup title='Circuito RC' description='Nesse conteúdo vemos o circuito RC, suas fórmulas e utilidades como filtros' contents={[{ name: "Exercícios Práticos", type: "pdf", size: "3 MB" }]}/>
            <ContentGroup title='Circuito RC' description='Nesse conteúdo vemos o circuito RC, suas fórmulas e utilidades como filtros' contents={[{ name: "Exercícios Práticos", type: "pdf", size: "3 MB" }]}/>        
        </div>
    );
}

function ContentGroup({title, description, contents}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div class='content-group'>
            <div class='content-header'>
                <div class='content-group-info'>
                    <h3 class='content-group-title'>{title}</h3>
                    <button class='expand-btn' onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? '▼' : '▶'}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div class='content-group-body'>
                    <div class='content-description'>
                        <p>{description}</p>
                    </div>


                    <div class='content-list'>
                        {contents.map((content, index) => (
                            <div key={index} class='content-card'>
                                <div class='content-icon'>
                                    📁
                                </div>
                                <div class='content-info'>
                                    <h4>{content.name}</h4>
                                    <span class='content-meta'>{content.size}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Archives;