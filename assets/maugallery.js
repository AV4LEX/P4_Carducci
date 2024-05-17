(function($) {
  // Déclaration du plugin jQuery mauGallery
  $.fn.mauGallery = function(options) {
    // Fusion des options par défaut et des options fournies par l'utilisateur
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];

    return this.each(function() {
      // Création du conteneur pour les éléments de la galerie
      $.fn.mauGallery.methods.createRowWrapper($(this));

      // Création de la lightbox si l'option est activée
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }

      // Ajout des écouteurs d'événements
      $.fn.mauGallery.listeners(options);

      // Initialisation de chaque élément de la galerie
      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this)); // Rendre l'image réactive
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this)); // Déplacement de l'élément dans le conteneur
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns); // Emballage de l'élément dans une colonne

          // Collecte des tags
          var theTag = $(this).data("gallery-tag");
          if (options.showTags && theTag !== undefined && tagsCollection.indexOf(theTag) === -1) {
            tagsCollection.push(theTag);
          }
        });

      // Affichage des tags si l'option est activée
      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags($(this), options.tagsPosition, tagsCollection);
      }

      // Affichage de la galerie avec une animation de fondu
      $(this).fadeIn(500);
    });
  };

  // Options par défaut du plugin
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  // Ajout des écouteurs d'événements
  $.fn.mauGallery.listeners = function(options) {
    // Écouteur pour l'ouverture de la lightbox
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    // Écouteur pour le filtrage par tag
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);

    // Écouteurs pour la navigation dans la lightbox
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };

  // Méthodes du plugin
  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      // Crée un conteneur pour les éléments de la galerie s'il n'existe pas
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    wrapItemInColumn(element, columns) {
      // Emballe un élément de galerie dans une colonne de grille Bootstrap
      if (columns.constructor === Number) {
        element.wrap(`<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`);
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }
    },

    moveItemInRowWrapper(element) {
      // Déplace un élément dans le conteneur de la galerie
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
      // Ajoute une classe pour rendre les images réactives
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },

    openLightBox(element, lightboxId) {
      // Ouvre la lightbox avec l'image sélectionnée
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },

    prevImage(lightboxId) {
      // Affiche l'image précédente dans la lightbox
      let activeImageSrc = $(`#${lightboxId}`).find(".lightboxImage").attr("src");
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".gallery-item").each(function() {
          imagesCollection.push($(this));
        });
      } else {
        $(".gallery-item").each(function() {
          if ($(this).data("gallery-tag") === activeTag) {
            imagesCollection.push($(this));
          }
        });
      }
      let currentIndex = imagesCollection.findIndex(image => image.attr("src") === activeImageSrc);
      let prevIndex = (currentIndex - 1 + imagesCollection.length) % imagesCollection.length;
      $(`#${lightboxId}`).find(".lightboxImage").attr("src", imagesCollection[prevIndex].attr("src"));
    },

    nextImage(lightboxId) {
      // Affiche l'image suivante dans la lightbox
      let activeImageSrc = $(`#${lightboxId}`).find(".lightboxImage").attr("src");
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".gallery-item").each(function() {
          imagesCollection.push($(this));
        });
      } else {
        $(".gallery-item").each(function() {
          if ($(this).data("gallery-tag") === activeTag) {
            imagesCollection.push($(this));
          }
        });
      }
      let currentIndex = imagesCollection.findIndex(image => image.attr("src") === activeImageSrc);
      let nextIndex = (currentIndex + 1) % imagesCollection.length;
      $(`#${lightboxId}`).find(".lightboxImage").attr("src", imagesCollection[nextIndex].attr("src"));
    },

    createLightBox(gallery, lightboxId, navigation) {
      // Crée la structure HTML de la lightbox
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },

    showItemTags(gallery, position, tags) {
      // Affiche les tags de filtrage en fonction de leur position
      var tagItems = '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item">
                <span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    
      // Ajout des écouteurs d'événements pour les tags
      gallery.find('.nav-link').on('click', function() {
        if (!$(this).hasClass('active-tag')) {
          gallery.find('.active-tag').removeClass('active active-tag');
          $(this).addClass('active active-tag');
        }
    
        // Logique de filtrage des éléments de la galerie
        var tag = $(this).data('images-toggle');
        gallery.find('.gallery-item').each(function() {
          var $item = $(this).parents('.item-column');
          if (tag === 'all') {
            $item.show(300);
          } else if ($(this).data('gallery-tag') === tag) {
            $item.show(300);
          } else {
            $item.hide(300);
          }
        });
      });
        // Ajout des événements pour changer le curseur lors du survol
        gallery.find('.nav-link').on('mouseenter', function() {
          $(this).css('cursor', 'pointer'); // Change le curseur en une main quand la souris entre
        }).on('mouseleave', function() {
          $(this).css('cursor', ''); // Rétablit le curseur par défaut quand la souris quitte
        });
    },
    
    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        $(this)
          .parents(".item-column")
          .hide();
        if (tag === "all") {
          $(this)
            .parents(".item-column")
            .show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this)
            .parents(".item-column")
            .show(300);
        }
      });
    }
  };
})(jQuery);